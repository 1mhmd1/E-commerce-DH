import json
from django.core.management.base import BaseCommand
from shop.models import Product, Category

# Curated high-quality Unsplash images organized by common electronics categories
CATEGORY_IMAGES = {
    "laptops": [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
        "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
        "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80",
    ],
    "phones": [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80",
        "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80",
    ],
    "headphones": [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80",
        "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80",
    ],
    "monitors": [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
        "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80",
        "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&q=80",
        "https://images.unsplash.com/photo-1616711906333-23cf8e022f85?w=600&q=80",
    ],
    "accessories": [
        "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&q=80",
        "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80",
        "https://images.unsplash.com/photo-1586920740099-f3ceb65bc51e?w=600&q=80",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80",
    ],
    "cameras": [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80",
        "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=600&q=80",
        "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=600&q=80",
    ],
    "tablets": [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
        "https://images.unsplash.com/photo-1561154464-82e6e1b9b4f5?w=600&q=80",
        "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&q=80",
    ],
    "keyboards": [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80",
        "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80",
    ],
    "speakers": [
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80",
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    ],
}

# Generic fallback images for any category not in the map
GENERIC_IMAGES = [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
    "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80",
    "https://images.unsplash.com/photo-1573148195900-7845dcb9b127?w=600&q=80",
]


def _find_best_images(category_slug, product_name):
    """Try to find the best image list for a product by matching category slug or name keywords."""
    slug_lower = (category_slug or "").lower()

    # Direct slug match
    if slug_lower in CATEGORY_IMAGES:
        return CATEGORY_IMAGES[slug_lower]

    # Try matching product name keywords to category keys
    name_lower = product_name.lower()
    for key, images in CATEGORY_IMAGES.items():
        if key in name_lower or key.rstrip("s") in name_lower:
            return images

    return GENERIC_IMAGES


class Command(BaseCommand):
    help = "Update all products with real Unsplash image URLs"

    def handle(self, *args, **options):
        products = Product.objects.select_related("category").all()
        updated = 0

        for product in products:
            cat_slug = product.category.slug if product.category else ""
            images = _find_best_images(cat_slug, product.name)
            # Cycle through images based on product ID
            image_url = images[product.id % len(images)]

            if product.image != image_url:
                product.image = image_url
                product.save(update_fields=["image"])
                updated += 1
                self.stdout.write(f"  ✅ {product.name} → {image_url[:60]}...")

        self.stdout.write(self.style.SUCCESS(f"\nDone! Updated {updated}/{products.count()} products."))
