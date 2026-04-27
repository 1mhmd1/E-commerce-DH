from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Cart, CartItem, Category, Product


class CheckoutFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="john", password="secret1234")
        self.category = Category.objects.create(name="Gaming", slug="gaming")
        self.product = Product.objects.create(
            category=self.category,
            name="Gaming Beast",
            slug="gaming-beast",
            description="A fast machine",
            price=999,
            stock=2,
            rating=4.8,
            specs={"RAM": "16GB", "CPU": "i7"},
            performance_score=90,
        )

    def test_cannot_checkout_when_stock_invalid(self):
        self.client.force_authenticate(self.user)
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=3)

        res = self.client.post(reverse("checkout"), {"shipping_address": "Main street"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_cheap_sorts_by_price(self):
        Product.objects.create(
            category=self.category,
            name="Gaming Lite",
            slug="gaming-lite",
            description="Budget unit",
            price=499,
            stock=5,
            rating=4.1,
            specs={"RAM": "8GB", "CPU": "i5"},
            performance_score=70,
        )
        res = self.client.get(reverse("products-list") + "?search=cheap")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        prices = [float(p["price"]) for p in res.data["results"]]
        self.assertEqual(prices, sorted(prices))
