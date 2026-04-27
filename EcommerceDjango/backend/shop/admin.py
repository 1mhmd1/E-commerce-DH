from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html

from .models import Address, Cart, CartItem, Category, ContactMessage, Order, OrderItem, Payment, Product, Review

# ─── Site branding ───────────────────────────────────────────
admin.site.site_header = "DarkCart Administration"
admin.site.site_title = "DarkCart Admin"
admin.site.index_title = "Manage your store"


# ─── Category ────────────────────────────────────────────────
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "product_count", "created_at")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Products")
    def product_count(self, obj):
        return obj.products.count()


# ─── Product ─────────────────────────────────────────────────
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price",
        "stock",
        "rating",
        "performance_score",
        "featured",
        "image_preview",
        "created_at",
    )
    list_filter = ("category", "featured", "created_at")
    list_editable = ("price", "stock", "featured")
    search_fields = ("name", "description")
    readonly_fields = ("image_preview_large", "created_at", "updated_at")
    prepopulated_fields = {"slug": ("name",)}
    fieldsets = (
        (None, {"fields": ("name", "slug", "category", "description")}),
        ("Pricing & Stock", {"fields": ("price", "stock", "featured")}),
        ("Scores", {"fields": ("rating", "performance_score")}),
        ("Image", {"fields": ("image", "image_preview_large")}),
        ("Specifications", {"fields": ("specs",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    @admin.display(description="Preview")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:36px;border-radius:6px;object-fit:cover;" />', obj.image)
        return "—"

    @admin.display(description="Image Preview")
    def image_preview_large(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:200px;border-radius:10px;object-fit:cover;" />', obj.image)
        return "No image"


# ─── Review ──────────────────────────────────────────────────
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "rating", "short_comment", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("user__username", "product__name", "comment")
    raw_id_fields = ("user", "product")

    @admin.display(description="Comment")
    def short_comment(self, obj):
        return (obj.comment[:60] + "…") if len(obj.comment) > 60 else obj.comment


# ─── Cart ────────────────────────────────────────────────────
class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    raw_id_fields = ("product",)
    readonly_fields = ("line_total",)

    @admin.display(description="Line Total")
    def line_total(self, obj):
        if obj.product:
            return f"${obj.product.price * obj.quantity:.2f}"
        return "—"


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "item_count", "updated_at")
    search_fields = ("user__username",)
    inlines = [CartItemInline]

    @admin.display(description="Items")
    def item_count(self, obj):
        return obj.items.count()


# ─── Order ───────────────────────────────────────────────────
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name_snapshot", "unit_price", "quantity", "line_total")

    @admin.display(description="Line Total")
    def line_total(self, obj):
        return f"${obj.unit_price * obj.quantity:.2f}"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "total", "item_count", "created_at")
    list_filter = ("status", "created_at")
    list_editable = ("status",)
    search_fields = ("user__username", "shipping_address")
    date_hierarchy = "created_at"
    inlines = [OrderItemInline]
    readonly_fields = ("created_at", "updated_at")

    @admin.display(description="Items")
    def item_count(self, obj):
        return obj.items.count()


# ─── Payment ─────────────────────────────────────────────────
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "amount", "status", "stripe_session_id_short", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("stripe_session_id", "order__id")
    readonly_fields = ("stripe_session_id", "created_at", "updated_at")

    @admin.display(description="Stripe ID")
    def stripe_session_id_short(self, obj):
        sid = obj.stripe_session_id
        return (sid[:20] + "…") if len(sid) > 20 else sid


# ─── User (enhanced) ─────────────────────────────────────────
# Unregister default, re-register with richer display
admin.site.unregister(User)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "username",
        "email",
        "is_staff",
        "is_active",
        "date_joined",
        "last_login",
        "order_count",
    )
    list_filter = ("is_staff", "is_active", "date_joined")

    @admin.display(description="Orders")
    def order_count(self, obj):
        return obj.orders.count() if hasattr(obj, "orders") else 0


# ─── Address ─────────────────────────────────────────────────
@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("user", "label", "full_name", "city", "is_default", "created_at")
    list_filter = ("is_default", "country")
    search_fields = ("user__username", "full_name", "street", "city")


# ─── Contact Messages ────────────────────────────────────────
@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "name", "email", "read", "created_at")
    list_filter = ("read", "created_at")
    list_editable = ("read",)
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("name", "email", "subject", "message", "created_at")
