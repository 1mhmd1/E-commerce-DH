from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AddressViewSet,
    AdminAnalyticsView,
    CartView,
    CategoryListView,
    CheckoutView,
    CompareRecommendView,
    ContactMessageCreateView,
    OrderDetailView,
    OrderListView,
    ProductViewSet,
    ProfileView,
    RegisterView,
    StripeCheckoutSessionView,
    StripeWebhookView,
)

router = DefaultRouter()
router.register("products", ProductViewSet, basename="products")
router.register("addresses", AddressViewSet, basename="addresses")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("categories/", CategoryListView.as_view(), name="categories"),
    path("cart/", CartView.as_view(), name="cart"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("checkout/stripe/", StripeCheckoutSessionView.as_view(), name="stripe-checkout"),
    path("orders/", OrderListView.as_view(), name="orders"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("payments/stripe/webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
    path("admin/analytics/", AdminAnalyticsView.as_view(), name="admin-analytics-api"),
    path("contact/", ContactMessageCreateView.as_view(), name="contact"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("products/compare-recommend/", CompareRecommendView.as_view(), name="compare-recommend"),
    path("", include(router.urls)),
]
