from decimal import Decimal

from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from .models import Address, Cart, CartItem, Category, ContactMessage, Order, OrderItem, Product, Review


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Cart.objects.get_or_create(user=user)
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "user", "rating", "comment", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "stock",
            "rating",
            "image",
            "specs",
            "featured",
            "performance_score",
            "discount_percent",
            "discounted_price",
            "category",
        ]

    def get_discounted_price(self, obj):
        if obj.discount_percent and obj.discount_percent > 0:
            return str(round(float(obj.price) * (1 - obj.discount_percent / 100), 2))
        return None


class ProductDetailSerializer(ProductSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ["reviews"]


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True)

    class Meta:
        model = Cart
        fields = ["id", "items", "updated_at"]


class CheckoutSerializer(serializers.Serializer):
    shipping_address = serializers.CharField()

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        cart, _ = Cart.objects.get_or_create(user=user)
        items = list(cart.items.select_related("product"))
        if not items:
            raise serializers.ValidationError("Your cart is empty.")

        total = Decimal("0")
        order = Order.objects.create(
            user=user,
            shipping_address=validated_data["shipping_address"],
            status=Order.Status.PENDING,
        )

        for item in items:
            product = item.product
            if item.quantity > product.stock:
                raise serializers.ValidationError(
                    f"Insufficient stock for {product.name}. Available: {product.stock}"
                )

            product.stock -= item.quantity
            product.save(update_fields=["stock"])

            line_total = product.price * item.quantity
            total += line_total

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name_snapshot=product.name,
                unit_price=product.price,
                quantity=item.quantity,
            )

        order.total = total
        order.save(update_fields=["total"])
        cart.items.all().delete()
        return order


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product_name_snapshot", "unit_price", "quantity"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "status", "total", "shipping_address", "created_at", "items"]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "label", "full_name", "street", "city", "state", "zip_code", "country", "is_default"]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "subject", "message"]


class ProfileSerializer(serializers.ModelSerializer):
    order_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined", "order_count"]
        read_only_fields = ["id", "username", "date_joined", "order_count"]

    def get_order_count(self, obj):
        return obj.orders.count() if hasattr(obj, "orders") else 0
