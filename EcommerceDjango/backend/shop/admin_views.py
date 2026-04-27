from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, F, Sum
from django.shortcuts import render

from .models import Order, Product


@staff_member_required
def analytics_dashboard(request):
    revenue = Order.objects.aggregate(total=Sum("total"))["total"] or 0
    total_orders = Order.objects.count()
    top_products = list(
        Product.objects.annotate(total_sold=Count("orderitem"))
        .values("name", "total_sold")
        .order_by("-total_sold")[:7]
    )
    stock_levels = list(Product.objects.values("name", stock=F("stock"))[:10])

    return render(
        request,
        "admin/analytics.html",
        {
            "revenue": revenue,
            "total_orders": total_orders,
            "top_products": top_products,
            "stock_levels": stock_levels,
        },
    )
