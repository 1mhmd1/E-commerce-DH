import random
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from shop.models import Category, Product


CATALOG = [
    # Laptops
    {"name": "AstraBook Air 14", "category": "Laptops", "base_price": 899, "cpu": "Ryzen 5", "ram": "16GB", "storage": "512GB", "panel": "14\" IPS", "score": 78},
    {"name": "AstraBook Pro 16", "category": "Laptops", "base_price": 1499, "cpu": "i7", "ram": "32GB", "storage": "1TB", "panel": "16\" IPS", "score": 90},
    {"name": "Nebula Creator X", "category": "Laptops", "base_price": 1799, "cpu": "i9", "ram": "32GB", "storage": "1TB", "panel": "16\" OLED", "score": 96},
    {"name": "Drift Student 13", "category": "Laptops", "base_price": 699, "cpu": "i5", "ram": "8GB", "storage": "256GB", "panel": "13\" IPS", "score": 66},
    {"name": "Titan Gaming 17", "category": "Laptops", "base_price": 1999, "cpu": "Ryzen 9", "ram": "32GB", "storage": "1TB", "panel": "17\" 165Hz", "score": 99},
    # Smartphones
    {"name": "Volt Phone S", "category": "Smartphones", "base_price": 699, "cpu": "A16", "ram": "8GB", "storage": "256GB", "panel": "6.1\" OLED", "score": 82},
    {"name": "Volt Phone Pro", "category": "Smartphones", "base_price": 999, "cpu": "A17", "ram": "12GB", "storage": "512GB", "panel": "6.7\" OLED", "score": 91},
    {"name": "Pixel Nova 8", "category": "Smartphones", "base_price": 849, "cpu": "Tensor X", "ram": "12GB", "storage": "256GB", "panel": "6.4\" OLED", "score": 87},
    {"name": "Orbit Budget 5G", "category": "Smartphones", "base_price": 399, "cpu": "Snapdragon 7", "ram": "8GB", "storage": "128GB", "panel": "6.6\" LCD", "score": 70},
    {"name": "Orbit Ultra Max", "category": "Smartphones", "base_price": 1099, "cpu": "Snapdragon 8", "ram": "16GB", "storage": "512GB", "panel": "6.8\" OLED", "score": 94},
    # Audio
    {"name": "Pulse ANC Headset", "category": "Audio", "base_price": 249, "cpu": "DSP Gen2", "ram": "N/A", "storage": "N/A", "panel": "Over-Ear", "score": 76},
    {"name": "Pulse Studio Pro", "category": "Audio", "base_price": 349, "cpu": "DSP Gen3", "ram": "N/A", "storage": "N/A", "panel": "Over-Ear", "score": 84},
    {"name": "Wave Buds Lite", "category": "Audio", "base_price": 79, "cpu": "Bluetooth 5.3", "ram": "N/A", "storage": "N/A", "panel": "In-Ear", "score": 62},
    {"name": "Wave Buds Elite", "category": "Audio", "base_price": 159, "cpu": "Bluetooth 5.4", "ram": "N/A", "storage": "N/A", "panel": "In-Ear", "score": 74},
    {"name": "EchoBar 500", "category": "Audio", "base_price": 429, "cpu": "7.1 DSP", "ram": "N/A", "storage": "N/A", "panel": "Soundbar", "score": 85},
    # Accessories
    {"name": "Glide Mouse Pro", "category": "Accessories", "base_price": 89, "cpu": "PixArt 26K", "ram": "N/A", "storage": "N/A", "panel": "Wireless", "score": 68},
    {"name": "Glide Mouse Ultra", "category": "Accessories", "base_price": 129, "cpu": "PixArt 30K", "ram": "N/A", "storage": "N/A", "panel": "Wireless", "score": 77},
    {"name": "Forge Keyboard 75", "category": "Accessories", "base_price": 139, "cpu": "Hot-swap", "ram": "N/A", "storage": "N/A", "panel": "75%", "score": 72},
    {"name": "Forge Keyboard TKL", "category": "Accessories", "base_price": 159, "cpu": "Hot-swap", "ram": "N/A", "storage": "N/A", "panel": "TKL", "score": 75},
    {"name": "Volt Dock 12-in-1", "category": "Accessories", "base_price": 119, "cpu": "PD 100W", "ram": "N/A", "storage": "N/A", "panel": "Aluminum", "score": 64},
    # Gaming
    {"name": "Reactor Console One", "category": "Gaming", "base_price": 499, "cpu": "Zen 2", "ram": "16GB", "storage": "1TB", "panel": "4K HDR", "score": 88},
    {"name": "Reactor Handheld GO", "category": "Gaming", "base_price": 649, "cpu": "Zen 4", "ram": "16GB", "storage": "512GB", "panel": "7\" 120Hz", "score": 86},
    {"name": "Blaze GPU Box", "category": "Gaming", "base_price": 799, "cpu": "RTX Class", "ram": "16GB", "storage": "N/A", "panel": "eGPU", "score": 92},
    {"name": "Apex Gamepad X", "category": "Gaming", "base_price": 69, "cpu": "Hall Effect", "ram": "N/A", "storage": "N/A", "panel": "Wireless", "score": 60},
    {"name": "Apex Racing Wheel", "category": "Gaming", "base_price": 399, "cpu": "Force Feedback", "ram": "N/A", "storage": "N/A", "panel": "Premium", "score": 79},
    # Monitors
    {"name": "Vision 27 QHD", "category": "Monitors", "base_price": 329, "cpu": "N/A", "ram": "N/A", "storage": "N/A", "panel": "27\" 165Hz", "score": 73},
    {"name": "Vision 32 4K", "category": "Monitors", "base_price": 599, "cpu": "N/A", "ram": "N/A", "storage": "N/A", "panel": "32\" 4K", "score": 81},
    {"name": "Vision OLED 34", "category": "Monitors", "base_price": 1199, "cpu": "N/A", "ram": "N/A", "storage": "N/A", "panel": "34\" OLED", "score": 95},
    {"name": "Vision Budget 24", "category": "Monitors", "base_price": 179, "cpu": "N/A", "ram": "N/A", "storage": "N/A", "panel": "24\" IPS", "score": 58},
    {"name": "Vision Curved 49", "category": "Monitors", "base_price": 999, "cpu": "N/A", "ram": "N/A", "storage": "N/A", "panel": "49\" 144Hz", "score": 93},
]


class Command(BaseCommand):
    help = "Seed realistic demo data (30 products)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all products before seeding.",
        )

    def handle(self, *args, **options):
        rng = random.Random(42)
        user_model = get_user_model()

        if options.get("reset"):
            Product.objects.all().delete()
            self.stdout.write(self.style.WARNING("Existing products deleted."))

        default_user, user_created = user_model.objects.get_or_create(
            username="demo_user",
            defaults={"email": "demo@darkcart.local"},
        )
        if user_created:
            default_user.set_password("DemoUser@123")
            default_user.save(update_fields=["password"])

        admin_user, admin_created = user_model.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@darkcart.local",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if admin_created:
            admin_user.set_password("Admin@12345")
            admin_user.save(update_fields=["password"])
        elif not admin_user.is_staff or not admin_user.is_superuser:
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save(update_fields=["is_staff", "is_superuser"])

        category_cache = {}
        upserted = 0

        for item in CATALOG:
            category_name = item["category"]
            category = category_cache.get(category_name)
            if not category:
                category, _ = Category.objects.get_or_create(
                    name=category_name,
                    defaults={"slug": slugify(category_name)},
                )
                category_cache[category_name] = category

            # Add small realistic variance while keeping prices/rating in a sane range.
            price = Decimal(str(max(49, item["base_price"] + rng.randint(-30, 70))))
            rating = Decimal(str(round(rng.uniform(3.5, 5.0), 2)))
            stock = rng.randint(0, 120)

            product, _ = Product.objects.update_or_create(
                slug=slugify(item["name"]),
                defaults={
                    "category": category,
                    "name": item["name"],
                    "description": (
                        f"{item['name']} is tuned for modern shoppers who want reliable performance, "
                        "premium finish, and strong value in everyday usage."
                    ),
                    "price": price,
                    "stock": stock,
                    "rating": rating,
                    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
                    "specs": {
                        "RAM": item["ram"],
                        "CPU": item["cpu"],
                        "Storage": item["storage"],
                        "Panel": item["panel"],
                    },
                    "featured": item["score"] >= 88 or rng.choice([True, False]),
                    "performance_score": item["score"],
                },
            )
            upserted += 1

            if product.stock == 0 and product.featured:
                product.featured = False
                product.save(update_fields=["featured"])

        self.stdout.write(self.style.SUCCESS(f"Seed complete. Upserted {upserted} products."))
        self.stdout.write("Demo user: demo_user / DemoUser@123")
        self.stdout.write("Admin user: admin / Admin@12345")
