import json
import logging

from django.conf import settings
from django.db.models import Q
from difflib import SequenceMatcher

from .models import Category, Product

logger = logging.getLogger(__name__)

# ────────────────────────────────────────────────────────────
# AI-powered query interpretation via Google Gemini
# ────────────────────────────────────────────────────────────

_gemini_model = None


def _get_gemini_model():
    """Lazy-init the Gemini model so we only load it once."""
    global _gemini_model
    if _gemini_model is not None:
        return _gemini_model

    api_key = getattr(settings, "GEMINI_API_KEY", "")
    if not api_key:
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        _gemini_model = genai.GenerativeModel("gemini-2.0-flash")
        return _gemini_model
    except Exception as exc:
        logger.warning("Gemini init failed: %s", exc)
        return None


def _ai_interpret(query: str) -> dict | None:
    """
    Ask Gemini to convert a natural-language shopping query into
    structured filter parameters that Django can execute.
    """
    model = _get_gemini_model()
    if model is None:
        return None

    categories = list(Category.objects.values_list("slug", flat=True))
    products_sample = list(
        Product.objects.values("name", "price", "category__name")
        .order_by("price")[:20]
    )
    price_range = Product.objects.order_by("price").values_list("price", flat=True)
    min_price = float(price_range.first() or 0)
    max_price = float(price_range.last() or 99999)

    prompt = f"""You are a product search assistant for an e-commerce electronics store called DarkCart.

Available categories (slugs): {categories}
Price range in store: ${min_price:.0f} – ${max_price:.0f}
Sample products: {json.dumps(products_sample, default=str)[:600]}

The user typed: "{query}"

Your job: interpret what the user wants and return structured filters.

IMPORTANT RULES:
- If user says "cheapest" or "lowest price" → set sort to "price_asc"
- If user says "most expensive" or "highest price" → set sort to "price_desc"  
- If user says "best" or "top rated" → set sort to "rating_desc"
- If user mentions a budget like "under $500" → set price_max to 500
- If user mentions a minimum like "above $200" → set price_min to 200
- Always extract meaningful keywords from the query
- Match category slug from the available list if the query clearly refers to one

Return ONLY a valid JSON object (no markdown fences, no explanation) with these keys:
- "sort": one of "price_asc", "price_desc", "rating_desc", "newest" or null
- "category": category slug from the list or null
- "price_max": number or null
- "price_min": number or null  
- "in_stock": true if user wants available items, else null
- "keywords": list of 1-3 important search words (always provide at least one relevant keyword)

Examples:
User: "cheapest laptop" → {{"sort":"price_asc","category":null,"price_max":null,"price_min":null,"in_stock":null,"keywords":["laptop"]}}
User: "best gaming monitor under 800" → {{"sort":"rating_desc","category":"monitors","price_max":800,"price_min":null,"in_stock":null,"keywords":["gaming","monitor"]}}
User: "show me the most expensive one" → {{"sort":"price_desc","category":null,"price_max":null,"price_min":null,"in_stock":null,"keywords":[]}}

Now respond with ONLY the JSON for: "{query}"
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
        return json.loads(text)
    except Exception as exc:
        logger.warning("Gemini search failed: %s", exc)
        return None


# ────────────────────────────────────────────────────────────
# Main search dispatcher
# ────────────────────────────────────────────────────────────

def apply_smart_search(queryset, term: str):
    if not term:
        return queryset

    # ── Try AI interpretation first ──
    ai_filters = _ai_interpret(term)
    if ai_filters:
        logger.info("AI filters for '%s': %s", term, ai_filters)
        return _apply_ai_filters(queryset, ai_filters)

    # ── Fallback: keyword-based search ──
    return _keyword_search(queryset, term)


def _apply_ai_filters(queryset, filters: dict):
    """Apply the structured filters returned by Gemini."""
    category = filters.get("category")
    price_min = filters.get("price_min")
    price_max = filters.get("price_max")
    in_stock = filters.get("in_stock")
    sort = filters.get("sort")
    keywords = filters.get("keywords", [])

    if category:
        queryset = queryset.filter(category__slug__iexact=category)
    if price_min is not None:
        queryset = queryset.filter(price__gte=price_min)
    if price_max is not None:
        queryset = queryset.filter(price__lte=price_max)
    if in_stock:
        queryset = queryset.filter(stock__gt=0)

    # Keyword filter — only if keywords are provided and non-empty
    if keywords:
        word_filter = Q()
        for kw in keywords:
            if kw:  # skip empty strings
                word_filter |= Q(name__icontains=kw) | Q(description__icontains=kw) | Q(category__name__icontains=kw)
        if word_filter:
            queryset = queryset.filter(word_filter).distinct()

    # Sorting
    sort_map = {
        "price_asc": "price",
        "price_desc": "-price",
        "rating_desc": "-rating",
        "newest": "-created_at",
    }
    if sort and sort in sort_map:
        queryset = queryset.order_by(sort_map[sort])

    return queryset


def _keyword_search(queryset, term: str):
    """Legacy keyword-based search as fallback."""
    clean = term.lower().strip()
    words = [w for w in clean.split() if w]

    if "cheap" in words or "cheapest" in words or "budget" in words or "lowest" in words:
        queryset = queryset.order_by("price")

    if "expensive" in words or "highest" in words:
        queryset = queryset.order_by("-price")

    if "best" in words or "top" in words:
        queryset = queryset.order_by("-rating")

    word_filter = Q()
    for word in words:
        if word in ("cheap", "cheapest", "budget", "lowest", "expensive", "highest", "best", "top", "the", "one", "me", "show", "find", "get"):
            continue  # skip stop words
        word_filter |= Q(name__icontains=word)
        word_filter |= Q(description__icontains=word)
        word_filter |= Q(category__name__icontains=word)

    if word_filter:
        queryset = queryset.filter(word_filter).distinct()

    # Fuzzy fallback
    if not queryset.exists() and words:
        catalog = Product.objects.values("id", "name")[:250]
        fuzzy_ids = []
        target = " ".join(words)
        for row in catalog:
            score = SequenceMatcher(None, target, row["name"].lower()).ratio()
            if score >= 0.4:
                fuzzy_ids.append(row["id"])
        if fuzzy_ids:
            queryset = Product.objects.filter(id__in=fuzzy_ids)

    return queryset
