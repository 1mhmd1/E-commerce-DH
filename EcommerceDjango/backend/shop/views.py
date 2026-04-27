from django.conf import settings
from django.db import transaction
from django.db.models import Count, F, Sum
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import stripe
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Address, Cart, CartItem, Category, Order, OrderItem, Payment, Product
from .search import apply_smart_search
from .serializers import (
    AddressSerializer,
    CartSerializer,
    CategorySerializer,
    CheckoutSerializer,
    ContactMessageSerializer,
    OrderSerializer,
    ProductDetailSerializer,
    ProductSerializer,
    ProfileSerializer,
    RegisterSerializer,
)

stripe.api_key = settings.STRIPE_SECRET_KEY


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.select_related("category").all()

    def get_serializer_class(self):
        return ProductDetailSerializer if self.action == "retrieve" else ProductSerializer

    def get_queryset(self):
        queryset = super().get_queryset().filter(stock__gte=0)
        category = self.request.query_params.get("category")
        in_stock = self.request.query_params.get("in_stock")
        on_offer = self.request.query_params.get("on_offer")
        price_min = self.request.query_params.get("price_min")
        price_max = self.request.query_params.get("price_max")
        search = self.request.query_params.get("search", "")
        ordering = self.request.query_params.get("ordering", "")

        if category:
            queryset = queryset.filter(category__slug=category)
        if in_stock == "true":
            queryset = queryset.filter(stock__gt=0)
        if on_offer == "true":
            queryset = queryset.filter(discount_percent__gt=0)
        if price_min:
            queryset = queryset.filter(price__gte=price_min)
        if price_max:
            queryset = queryset.filter(price__lte=price_max)

        # Apply ordering before AI search (so AI sort can override)
        order_map = {
            "price_asc": "price",
            "price_desc": "-price",
            "rating": "-rating",
            "newest": "-created_at",
        }
        if ordering in order_map:
            queryset = queryset.order_by(order_map[ordering])

        return apply_smart_search(queryset, search)

    @action(detail=False, methods=["get"], url_path="featured")
    def featured(self, request):
        products = self.get_queryset().filter(featured=True)[:8]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="recommendations")
    def recommendations(self, request):
        products = self.get_queryset().filter(stock__gt=0).order_by("-rating", "-performance_score")[:12]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="suggestions")
    def suggestions(self, request):
        q = request.query_params.get("q", "")
        if not q.strip():
            return Response([])

        suggestions = (
            Product.objects.filter(name__icontains=q)
            .values_list("name", flat=True)
            .distinct()[:6]
        )
        return Response(list(suggestions))

    @action(detail=True, methods=["get"], url_path="ai-insight")
    def ai_insight(self, request, pk=None):
        """Generate an AI-powered product insight using Gemini."""
        product = self.get_object()

        # Try Gemini first
        api_key = getattr(settings, "GEMINI_API_KEY", "")
        insight_text = None

        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel("gemini-2.0-flash")

                specs_text = ""
                if product.specs:
                    import json
                    specs_text = f"\nSpecifications: {json.dumps(product.specs)}"

                prompt = f"""You are a smart shopping assistant for EcoShop, an eco-friendly electronics store.

Analyze this product and give a concise, helpful insight to help the buyer decide:

Product: {product.name}
Category: {product.category.name}
Price: ${product.price}
Rating: {product.rating}/5
Stock: {product.stock} units available
Performance Score: {product.performance_score}/100{specs_text}
Description: {product.description[:300]}

Write a SHORT (3-4 sentences max) compelling analysis covering:
1. Why this product stands out
2. Value for money assessment
3. Who it's best for

Be conversational and helpful. Do NOT use markdown formatting. Do NOT use bullet points. Write in plain flowing sentences."""

                response = model.generate_content(prompt)
                insight_text = response.text.strip()
            except Exception as exc:
                import logging
                logging.getLogger(__name__).warning("Gemini insight failed: %s", exc)

        # Fallback if Gemini fails
        if not insight_text:
            insight_text = (
                f"{product.name} is a strong choice in the {product.category.name} category "
                f"with a user rating of {product.rating}/5 and a performance score of "
                f"{product.performance_score}/100. "
                f"{'Currently well-stocked' if product.stock > 10 else 'Limited availability'} "
                f"at ${product.price}, it offers solid value for buyers looking for "
                f"reliability and quality."
            )

        return Response({
            "product_id": product.id,
            "product_name": product.name,
            "insight": insight_text,
            "rating": float(product.rating),
            "stock": product.stock,
            "performance_score": product.performance_score,
        })


class CompareRecommendView(APIView):
    """AI-powered compare recommendation using Gemini."""
    permission_classes = [AllowAny]

    def post(self, request):
        product_ids = request.data.get("product_ids", [])
        if not product_ids or len(product_ids) < 2:
            return Response(
                {"detail": "At least 2 product IDs are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        products = Product.objects.filter(id__in=product_ids)
        if products.count() < 2:
            return Response(
                {"detail": "Could not find enough products."},
                status=status.HTTP_404_NOT_FOUND,
            )

        import json

        products_info = []
        for p in products:
            products_info.append(
                f"- {p.name}: ${p.price}, Rating {p.rating}/5, "
                f"Performance {p.performance_score}/100, Stock {p.stock}, "
                f"Category {p.category.name}, "
                f"Specs: {json.dumps(p.specs) if p.specs else 'N/A'}, "
                f"Discount: {p.discount_percent}%"
            )

        products_text = "\n".join(products_info)

        prompt = f"""You are a smart shopping assistant for EcoShop.

The customer is comparing the following products and wants your recommendation on which one to buy:

{products_text}

Provide a clear, concise recommendation (5-6 sentences max):
1. Name the WINNER and explain why it's the best choice
2. Compare value-for-money across all products
3. Mention any standout specs or advantages
4. State which type of user each product suits best
5. If any product has a discount, mention the savings

Write in a helpful, conversational tone. Do NOT use markdown. Do NOT use bullet points. Write in plain flowing sentences."""

        api_key = getattr(settings, "GEMINI_API_KEY", "")
        recommendation = None

        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel("gemini-2.0-flash")
                response = model.generate_content(prompt)
                recommendation = response.text.strip()
            except Exception as exc:
                import logging
                logging.getLogger(__name__).warning("Gemini compare failed: %s", exc)

        if not recommendation:
            # Fallback: pick the product with the best score-to-price ratio
            best = max(products, key=lambda p: (p.performance_score or 0) / max(float(p.price), 1))
            recommendation = (
                f"Based on the available data, the {best.name} offers the best overall value "
                f"with a performance score of {best.performance_score}/100 at ${best.price}. "
                f"It has a {best.rating}/5 rating and is a solid choice for most buyers."
            )

        return Response({"recommendation": recommendation})


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        if not product_id:
            return Response({"detail": "product_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        if quantity < 1:
            return Response({"detail": "quantity must be at least 1."}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            item.quantity += quantity
            item.save(update_fields=["quantity"])

        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    def patch(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        item_id = request.data.get("item_id")
        if not item_id:
            return Response({"detail": "item_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        quantity = max(1, int(request.data.get("quantity", 1)))
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.quantity = quantity
        item.save(update_fields=["quantity"])
        return Response(CartSerializer(cart).data)

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        item_id = request.data.get("item_id")
        if not item_id:
            return Response({"detail": "item_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = CartItem.objects.filter(id=item_id, cart=cart).delete()
        if deleted == 0:
            return Response({"detail": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CartSerializer(cart).data)


class CheckoutView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CheckoutSerializer


class OrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class StripeCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        if not settings.STRIPE_SECRET_KEY:
            return Response({"detail": "Stripe not configured."}, status=status.HTTP_400_BAD_REQUEST)

        shipping_address = request.data.get("shipping_address", "")
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = list(cart.items.select_related("product"))

        if not items:
            return Response({"detail": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(
            user=request.user,
            shipping_address=shipping_address,
            status=Order.Status.PENDING,
        )

        line_items = []
        total = 0
        for item in items:
            product = item.product
            if item.quantity > product.stock:
                return Response(
                    {"detail": f"Insufficient stock for {product.name}. Available: {product.stock}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # ── Fix 1: deduct stock immediately (not relying on webhook in local dev) ──
            product.stock = max(0, product.stock - item.quantity)
            product.save(update_fields=["stock"])

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name_snapshot=product.name,
                unit_price=product.price,
                quantity=item.quantity,
            )

            total += product.price * item.quantity
            line_items.append(
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {"name": product.name},
                        "unit_amount": int(product.price * 100),
                    },
                    "quantity": item.quantity,
                }
            )

        order.total = total
        order.save(update_fields=["total"])

        # ── Fix 2: clear cart immediately after order is confirmed ──
        cart.items.all().delete()

        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            success_url=f"{settings.FRONTEND_BASE_URL}/checkout/success?order_id={order.id}",
            cancel_url=f"{settings.FRONTEND_BASE_URL}/checkout/cancel?order_id={order.id}",
            metadata={"order_id": str(order.id)},
        )

        Payment.objects.create(
            order=order,
            stripe_session_id=session.id,
            amount=order.total,
            status=Payment.Status.PENDING,
        )

        return Response({"url": session.url, "order_id": order.id})


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

        try:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET,
            )
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event.get("type") == "checkout.session.completed":
            session = event["data"]["object"]
            order_id = session.get("metadata", {}).get("order_id")
            if not order_id:
                return Response(status=status.HTTP_200_OK)

            with transaction.atomic():
                order = get_object_or_404(Order, id=order_id)
                payment, created = Payment.objects.get_or_create(
                    order=order,
                    stripe_session_id=session.get("id", ""),
                    defaults={"amount": order.total, "status": Payment.Status.PAID},
                )

                if not created and payment.status != Payment.Status.PAID:
                    payment.status = Payment.Status.PAID
                    payment.amount = order.total
                    payment.save(update_fields=["status", "amount"])

                if order.status != Order.Status.PAID:
                    for item in order.items.select_related("product"):
                        if item.product:
                            item.product.stock = max(0, item.product.stock - item.quantity)
                            item.product.save(update_fields=["stock"])
                    order.status = Order.Status.PAID
                    order.save(update_fields=["status"])

        return Response(status=status.HTTP_200_OK)


class AdminAnalyticsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        revenue = Order.objects.aggregate(total=Sum("total"))["total"] or 0
        orders_count = Order.objects.count()
        top_products = (
            Product.objects.annotate(total_sold=Count("orderitem"))
            .values("name", "total_sold")
            .order_by("-total_sold")[:5]
        )
        stock_levels = list(Product.objects.values("name", stock=F("stock"))[:8])

        return Response(
            {
                "revenue": revenue,
                "orders": orders_count,
                "top_products": list(top_products),
                "stock_levels": stock_levels,
            }
        )


class AddressViewSet(viewsets.ModelViewSet):
    """CRUD for user addresses."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by("-is_default", "-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ContactMessageCreateView(generics.CreateAPIView):
    """Public endpoint — any visitor can submit a contact message."""
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]


class ProfileView(APIView):
    """Get or update the authenticated user's profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
