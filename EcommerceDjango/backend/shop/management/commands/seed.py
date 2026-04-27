"""
EcoShop Seed Command
====================
Populates the database with sample categories, products, and an admin user.

Usage:
    python manage.py seed
    python manage.py seed --clear     # Wipe existing data first
    python manage.py seed --admin     # Also create superuser admin/admin123
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils.text import slugify
from shop.models import Category, Product

# ─────────────────────────────────────────────────────────
# DATA
# ─────────────────────────────────────────────────────────

CATEGORIES = [
    {"name": "Laptops",     "slug": "laptops"},
    {"name": "Phones",      "slug": "phones"},
    {"name": "Headphones",  "slug": "headphones"},
    {"name": "Monitors",    "slug": "monitors"},
    {"name": "Keyboards",   "slug": "keyboards"},
    {"name": "Cameras",     "slug": "cameras"},
    {"name": "Tablets",     "slug": "tablets"},
    {"name": "Accessories", "slug": "accessories"},
]

PRODUCTS = [
    # ── Laptops ──────────────────────────────────────────
    {
        "category": "laptops",
        "name": "AstraBook Pro 16",
        "description": "A powerhouse laptop with a stunning 16-inch Retina display, 12-core processor, and all-day battery life — ideal for creators and professionals.",
        "price": "1899.99",
        "stock": 45,
        "rating": "4.80",
        "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
        "featured": True,
        "performance_score": 95,
        "discount_percent": 0,
        "specs": {"CPU": "12-core M3", "RAM": "32GB", "Storage": "1TB SSD", "Display": "16-inch Retina", "Battery": "22 hours"},
    },
    {
        "category": "laptops",
        "name": "AstraBook Air 14",
        "description": "Featherlight design meets exceptional performance. The AstraBook Air 14 is the perfect everyday companion.",
        "price": "1199.99",
        "stock": 60,
        "rating": "4.65",
        "image": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80",
        "featured": True,
        "performance_score": 82,
        "discount_percent": 15,
        "specs": {"CPU": "8-core M3", "RAM": "16GB", "Storage": "512GB SSD", "Display": "14-inch Liquid Retina", "Battery": "18 hours"},
    },
    {
        "category": "laptops",
        "name": "ProDesk Studio 15",
        "description": "Built for developers and designers. The ProDesk Studio 15 delivers desktop-class power in a portable form factor.",
        "price": "1499.00",
        "stock": 30,
        "rating": "4.55",
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
        "featured": False,
        "performance_score": 88,
        "discount_percent": 0,
        "specs": {"CPU": "Intel Core i9", "RAM": "32GB DDR5", "Storage": "2TB NVMe", "GPU": "RTX 4070", "Display": "15.6-inch 4K OLED"},
    },
    {
        "category": "laptops",
        "name": "BudgetBook Flex 13",
        "description": "The most affordable way to get into the EcoShop ecosystem. Solid performance for students and everyday users.",
        "price": "549.00",
        "stock": 120,
        "rating": "4.20",
        "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
        "featured": False,
        "performance_score": 62,
        "discount_percent": 20,
        "specs": {"CPU": "Intel Core i5", "RAM": "8GB", "Storage": "256GB SSD", "Display": "13.3-inch FHD", "Battery": "10 hours"},
    },

    # ── Phones ───────────────────────────────────────────
    {
        "category": "phones",
        "name": "NovaPulse X Pro",
        "description": "The flagship phone of the year. Triple camera system, titanium frame, and the fastest chip we've ever made.",
        "price": "999.00",
        "stock": 80,
        "rating": "4.90",
        "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
        "featured": True,
        "performance_score": 98,
        "discount_percent": 0,
        "specs": {"Display": "6.7-inch ProMotion OLED", "Camera": "200MP triple system", "Battery": "5000mAh", "Chip": "A18 Pro", "Storage": "256GB"},
    },
    {
        "category": "phones",
        "name": "NovaPulse SE",
        "description": "All the essentials at an unbeatable price. The SE is perfect for first-time smartphone buyers or those upgrading from an older device.",
        "price": "429.00",
        "stock": 150,
        "rating": "4.40",
        "image": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80",
        "featured": False,
        "performance_score": 70,
        "discount_percent": 10,
        "specs": {"Display": "6.1-inch OLED", "Camera": "48MP dual system", "Battery": "3500mAh", "Chip": "A16", "Storage": "128GB"},
    },
    {
        "category": "phones",
        "name": "GreenPhone EcoEdition",
        "description": "Made from 100% recycled materials without compromising on performance. The most eco-conscious smartphone on the market.",
        "price": "699.00",
        "stock": 55,
        "rating": "4.60",
        "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
        "featured": True,
        "performance_score": 80,
        "discount_percent": 0,
        "specs": {"Display": "6.4-inch AMOLED", "Camera": "64MP + 12MP", "Battery": "4800mAh", "Material": "Recycled Aluminum", "OS": "Android 15"},
    },

    # ── Headphones ───────────────────────────────────────
    {
        "category": "headphones",
        "name": "SoundForge Pro ANC",
        "description": "Industry-leading active noise cancellation meets 40-hour battery life. The gold standard in wireless headphones.",
        "price": "349.00",
        "stock": 90,
        "rating": "4.85",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
        "featured": True,
        "performance_score": 93,
        "discount_percent": 25,
        "specs": {"Type": "Over-ear", "ANC": "Adaptive", "Battery": "40 hours", "Driver": "40mm custom", "Connectivity": "Bluetooth 5.3"},
    },
    {
        "category": "headphones",
        "name": "BassFlow Studio",
        "description": "Designed for music producers and audiophiles. Flat response curve for accurate mixing and monitoring.",
        "price": "229.00",
        "stock": 40,
        "rating": "4.70",
        "image": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80",
        "featured": False,
        "performance_score": 87,
        "discount_percent": 0,
        "specs": {"Type": "Over-ear", "Response": "Flat studio tuning", "Impedance": "250 ohm", "Cable": "Detachable 3m", "Frequency": "5Hz-40kHz"},
    },
    {
        "category": "headphones",
        "name": "EcoAir Buds",
        "description": "True wireless earbuds with an eco-friendly bamboo charging case. Great sound, great values.",
        "price": "89.00",
        "stock": 200,
        "rating": "4.30",
        "image": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80",
        "featured": False,
        "performance_score": 65,
        "discount_percent": 15,
        "specs": {"Type": "In-ear TWS", "ANC": "Passive isolation", "Battery": "7h + 28h case", "Case": "Bamboo composite", "IPX": "IPX5"},
    },

    # ── Monitors ─────────────────────────────────────────
    {
        "category": "monitors",
        "name": "Vision Curved 49",
        "description": "Dominate your workspace with this ultra-wide curved display. Dual QHD resolution spans the entire width of your view.",
        "price": "1299.00",
        "stock": 25,
        "rating": "4.75",
        "image": "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80",
        "featured": True,
        "performance_score": 91,
        "discount_percent": 0,
        "specs": {"Size": "49 inches", "Resolution": "5120x1440 DQHD", "Panel": "VA Curved 1800R", "Refresh": "240Hz", "HDR": "HDR1000"},
    },
    {
        "category": "monitors",
        "name": "Vision OLED 34",
        "description": "Ultra-wide OLED monitor with true blacks, infinite contrast, and a blazing 175Hz refresh rate.",
        "price": "1099.00",
        "stock": 35,
        "rating": "4.80",
        "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
        "featured": False,
        "performance_score": 94,
        "discount_percent": 10,
        "specs": {"Size": "34 inches", "Resolution": "3440x1440 WQHD", "Panel": "OLED", "Refresh": "175Hz", "Response": "0.1ms"},
    },
    {
        "category": "monitors",
        "name": "Vision Budget 24",
        "description": "A sharp, colour-accurate IPS monitor for everyday computing and creative work at an unbeatable price.",
        "price": "229.00",
        "stock": 100,
        "rating": "4.25",
        "image": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&q=80",
        "featured": False,
        "performance_score": 68,
        "discount_percent": 0,
        "specs": {"Size": "24 inches", "Resolution": "1920x1080 FHD", "Panel": "IPS", "Refresh": "75Hz", "Ports": "HDMI, DP, USB-C"},
    },

    # ── Keyboards ────────────────────────────────────────
    {
        "category": "keyboards",
        "name": "MechKey Pro TKL",
        "description": "Tenkeyless mechanical keyboard with hot-swap sockets and gasket-mounted plate for premium typing feel.",
        "price": "149.00",
        "stock": 70,
        "rating": "4.70",
        "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
        "featured": True,
        "performance_score": 85,
        "discount_percent": 20,
        "specs": {"Layout": "TKL (87 keys)", "Switch": "Hot-swappable", "Plate": "Gasket mounted", "Backlighting": "Per-key RGB", "Connection": "USB-C + 2.4GHz wireless"},
    },
    {
        "category": "keyboards",
        "name": "SlimKey Eco",
        "description": "Ultra-thin wireless keyboard made from recycled aluminium. Pairs seamlessly with up to 3 devices.",
        "price": "79.00",
        "stock": 110,
        "rating": "4.35",
        "image": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80",
        "featured": False,
        "performance_score": 60,
        "discount_percent": 0,
        "specs": {"Layout": "Full-size", "Material": "Recycled aluminium", "Battery": "12 months", "Pairing": "3 device Bluetooth", "Thickness": "4.5mm"},
    },

    # ── Cameras ──────────────────────────────────────────
    {
        "category": "cameras",
        "name": "LensMax Mirrorless R7",
        "description": "Professional full-frame mirrorless camera with 45MP sensor, 8-stop IBIS, and 8K RAW video recording.",
        "price": "2499.00",
        "stock": 18,
        "rating": "4.90",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
        "featured": True,
        "performance_score": 97,
        "discount_percent": 0,
        "specs": {"Sensor": "45MP Full-Frame BSI CMOS", "IBIS": "8-stop", "Video": "8K RAW / 4K 120fps", "AF": "1053-point Dual Pixel", "Mount": "RF"},
    },
    {
        "category": "cameras",
        "name": "VlogCam Compact X",
        "description": "Content creator's dream: flip-screen, 4K60, and built-in ND filter. Goes everywhere you go.",
        "price": "749.00",
        "stock": 50,
        "rating": "4.55",
        "image": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80",
        "featured": False,
        "performance_score": 79,
        "discount_percent": 15,
        "specs": {"Sensor": "1-inch 20MP", "Video": "4K 60fps", "Screen": "Fully articulated flip", "ND Filter": "Built-in variable ND", "Stabilization": "5-axis OIS"},
    },

    # ── Tablets ──────────────────────────────────────────
    {
        "category": "tablets",
        "name": "SlateMax Pro 12.9",
        "description": "The world's most powerful tablet. Paired with the Magic Pencil, it replaces your sketchbook, notebook, and laptop.",
        "price": "1099.00",
        "stock": 40,
        "rating": "4.80",
        "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
        "featured": True,
        "performance_score": 96,
        "discount_percent": 0,
        "specs": {"Display": "12.9-inch Liquid Retina XDR", "Chip": "M4", "RAM": "16GB", "Storage": "512GB", "Connectivity": "5G + WiFi 7"},
    },
    {
        "category": "tablets",
        "name": "Slate Air 11",
        "description": "Lighter than ever, more powerful than you'd expect. The Air is the everyday tablet for students and professionals.",
        "price": "649.00",
        "stock": 65,
        "rating": "4.60",
        "image": "https://images.unsplash.com/photo-1561154464-82e6e1b9b4f5?w=600&q=80",
        "featured": False,
        "performance_score": 84,
        "discount_percent": 10,
        "specs": {"Display": "11-inch Liquid Retina", "Chip": "M3", "RAM": "8GB", "Storage": "256GB", "Connectivity": "WiFi 6E"},
    },

    # ── Accessories ──────────────────────────────────────
    {
        "category": "accessories",
        "name": "GreenCharge 100W GaN",
        "description": "Charge all your devices at once with this 100W 4-port GaN charger. Eco-packaging, zero waste included.",
        "price": "59.00",
        "stock": 300,
        "rating": "4.45",
        "image": "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&q=80",
        "featured": False,
        "performance_score": 72,
        "discount_percent": 0,
        "specs": {"Wattage": "100W total", "Ports": "2x USB-C + 2x USB-A", "Technology": "GaN III", "Size": "Compact", "Certifications": "MFi, PD 3.1"},
    },
    {
        "category": "accessories",
        "name": "EcoTrack MagMouse",
        "description": "Wireless ergonomic mouse with magnetic scroll wheel and a recycled plastic shell. Tracks on any surface.",
        "price": "49.00",
        "stock": 180,
        "rating": "4.20",
        "image": "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80",
        "featured": False,
        "performance_score": 58,
        "discount_percent": 25,
        "specs": {"DPI": "200-8000 adjustable", "Buttons": "7 programmable", "Battery": "6 months AAA", "Scroll": "Magnetic fast-scroll", "Material": "60% recycled plastic"},
    },
]


class Command(BaseCommand):
    help = "Seed the database with EcoShop categories and products"

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Clear existing products and categories before seeding")
        parser.add_argument("--admin", action="store_true", help="Create superuser admin/admin123")

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write("🗑  Clearing existing data...")
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write("   Done.\n")

        # ── Create/update categories ──
        self.stdout.write("📂 Seeding categories...")
        cat_map = {}
        for cat_data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                slug=cat_data["slug"],
                defaults={"name": cat_data["name"]},
            )
            cat_map[cat_data["slug"]] = cat
            marker = "✅ Created" if created else "⏭  Exists"
            self.stdout.write(f"   {marker}: {cat.name}")

        # ── Create/update products ──
        self.stdout.write("\n📦 Seeding products...")
        created_count = 0
        updated_count = 0

        for p in PRODUCTS:
            cat = cat_map.get(p["category"])
            if not cat:
                self.stdout.write(self.style.WARNING(f"  ⚠ Unknown category: {p['category']}, skipping {p['name']}"))
                continue

            slug = slugify(p["name"])
            product, created = Product.objects.update_or_create(
                slug=slug,
                defaults={
                    "category": cat,
                    "name": p["name"],
                    "description": p["description"],
                    "price": p["price"],
                    "stock": p["stock"],
                    "rating": p["rating"],
                    "image": p["image"],
                    "featured": p["featured"],
                    "performance_score": p["performance_score"],
                    "discount_percent": p.get("discount_percent", 0),
                    "specs": p.get("specs", {}),
                },
            )
            if created:
                self.stdout.write(f"   ✅ Created: {product.name}")
                created_count += 1
            else:
                self.stdout.write(f"   🔄 Updated: {product.name}")
                updated_count += 1

        # ── Admin user ──
        if options["admin"]:
            self.stdout.write("\n👤 Creating admin user...")
            if not User.objects.filter(username="admin").exists():
                User.objects.create_superuser("admin", "admin@ecoshop.dev", "admin123")
                self.stdout.write("   ✅ admin / admin123")
            else:
                self.stdout.write("   ⏭  admin already exists")

        self.stdout.write(self.style.SUCCESS(
            f"\n🌱 Seed complete! {created_count} created, {updated_count} updated."
        ))
