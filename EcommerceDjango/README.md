# EcoShop — Sustainable AI-Powered E-Commerce Platform

<div align="center">
  <strong>A full-stack eco-friendly e-commerce platform powered by Django, React, Stripe, and Google Gemini AI.</strong>
</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **AI Search** | Natural language product search using Google Gemini |
| 🤖 **AI Product Insights** | Per-product AI analysis via Gemini 2.0 Flash |
| 💳 **Stripe Checkout** | Secure payment with redirect flow |
| 🛒 **Cart Management** | Persistent server-side cart with JWT auth |
| 📦 **Order Tracking** | Full order history with status updates |
| 🗺 **Address Book** | Save and manage multiple shipping addresses |
| 🌗 **Dark Theme** | Pure black background with green eco accents |
| 🎞 **Animated UI** | Framer Motion entrance, marquee, and 3D effects |
| 📊 **Admin Analytics** | Sales and inventory dashboard |

---

## 🗂 Project Structure

```
EcommerceDjango/
├── backend/                   # Django REST API
│   ├── config/
│   │   ├── settings.py        # Django settings + env config
│   │   └── urls.py            # Root URL configuration
│   ├── shop/
│   │   ├── models.py          # DB models (Product, Order, Cart, ...)
│   │   ├── serializers.py     # DRF serializers
│   │   ├── views.py           # API views + Stripe + AI endpoints
│   │   ├── search.py          # Gemini AI search logic
│   │   ├── admin.py           # Django admin registrations
│   │   └── management/
│   │       └── commands/
│   │           ├── seed.py          # Populate DB with sample products
│   │           └── update_images.py # Assign Unsplash images to products
│   ├── .env                   # Environment variables (not committed)
│   └── requirements.txt       # Python dependencies
│
└── frontend/                  # React + Vite SPA
    ├── src/
    │   ├── api/               # Axios API client modules
    │   │   ├── client.js      # Axios instance + JWT interceptor
    │   │   ├── products.js    # Product & AI API calls
    │   │   ├── commerce.js    # Cart, orders, profile, addresses
    │   │   └── auth.js        # Login, register, logout
    │   ├── components/        # Reusable UI components
    │   │   ├── Navbar.jsx     # Top navigation with icons
    │   │   ├── ProductCard.jsx
    │   │   ├── WhyModal.jsx   # AI insight modal
    │   │   ├── SearchBar.jsx  # AI-powered search + chips
    │   │   └── Footer.jsx
    │   ├── pages/             # Route-level page components
    │   │   ├── HomePage.jsx         # Landing page with hero + marquee
    │   │   ├── ProductsPage.jsx     # Catalog with filters
    │   │   ├── ProductDetailsPage.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx     # Stripe checkout
    │   │   ├── CheckoutSuccessPage.jsx
    │   │   ├── AccountPage.jsx      # Orders, profile, addresses
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx
    │   ├── store/
    │   │   └── useStore.js    # Zustand global state (cart, auth)
    │   ├── hooks/
    │   │   └── useScrollReveal.js
    │   └── styles/
    │       └── index.css      # Global dark theme CSS
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or SQLite for local dev via `USE_SQLITE=True`)

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1          # Windows
source venv/bin/activate             # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env                 # Edit with your keys

# Run migrations
python manage.py migrate

# Seed the database with sample products
python manage.py seed --admin        # Creates products + admin/admin123

# Start the server
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## ⚙️ Environment Variables

Create `backend/.env` with the following:

```env
USE_SQLITE=True                    # Use SQLite for local dev
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=*

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=AIza...
FRONTEND_BASE_URL=http://localhost:5173

CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register/` | Register new user |
| `POST` | `/api/auth/token/` | Get JWT token pair |
| `POST` | `/api/auth/token/refresh/` | Refresh access token |
| `GET` | `/api/products/` | List products (filterable) |
| `GET` | `/api/products/{id}/` | Product detail |
| `GET` | `/api/products/{id}/ai-insight/` | Gemini AI product analysis |
| `GET` | `/api/products/featured/` | Featured products |
| `GET` | `/api/products/recommendations/` | Recommended products |
| `GET` | `/api/products/suggestions/?q=` | Autocomplete suggestions |
| `GET/POST/PATCH/DELETE` | `/api/cart/` | Cart management |
| `POST` | `/api/checkout/stripe/` | Create Stripe session (clears cart + deducts stock) |
| `GET` | `/api/orders/` | User's order list |
| `GET` | `/api/orders/{id}/` | Order detail |
| `GET/PATCH` | `/api/profile/` | User profile |
| `GET/POST/PATCH/DELETE` | `/api/addresses/` | Address management |
| `GET/POST` | `/api/categories/` | Product categories |

---

## 🛒 Checkout Flow

```
User fills Checkout form
    → POST /api/checkout/stripe/
    → Backend creates Order + deducts stock + clears cart immediately
    → Stripe checkout session created
    → User redirected to Stripe hosted payment page
    → On payment success → redirected to /checkout/success?order_id=X
    → Frontend clears Zustand cart state on success page mount
    → Stripe webhook updates payment status to PAID (in production)
```

---

## 🧪 Useful Commands

```bash
# Seed products and categories
python manage.py seed

# Seed with fresh wipe + create admin user
python manage.py seed --clear --admin

# Assign real Unsplash images to all products
python manage.py update_images

# Create superuser manually
python manage.py createsuperuser

# Run Django tests
python manage.py test
```

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Framer Motion, Zustand, Tailwind CSS |
| **Backend** | Django 4, Django REST Framework, SimpleJWT |
| **Database** | PostgreSQL (prod) / SQLite (dev) |
| **Payments** | Stripe Checkout |
| **AI** | Google Gemini 2.0 Flash |
| **Auth** | JWT (access + refresh tokens) |

---

## 📄 License

MIT License — free to use, modify, and distribute.
