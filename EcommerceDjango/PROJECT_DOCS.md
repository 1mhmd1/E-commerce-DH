# EcoShop — Project Documentation

> Deep-dive explanation of the project architecture, data models, and how the pieces connect.

---

## 1. What is EcoShop?

EcoShop is a full-stack e-commerce platform with an eco-friendly theme. It allows users to browse products, search using natural language powered by Google Gemini AI, add items to a persistent cart, and pay via Stripe. Orders are tracked on the user's account page alongside a saved address book and editable profile.

---

## 2. High-Level Architecture

```
Browser (React SPA)
       │
       │  REST JSON (HTTP / Axios)
       ▼
Django REST API  ────►  SQLite / PostgreSQL
       │
       ├──► Google Gemini API    (AI search + product insights)
       └──► Stripe API           (payment sessions + webhooks)
```

- **Frontend** is a single-page application (React + Vite). It communicates with the backend via `/api/*` REST endpoints. Authentication is handled using JWT tokens stored in localStorage.
- **Backend** is a Django project with one primary app (`shop`). It exposes a REST API using Django REST Framework.
- **Database** is SQLite in local development (`USE_SQLITE=True`) and PostgreSQL in production.

---

## 3. Backend App: `shop`

### 3.1 Models

| Model | Purpose |
|---|---|
| `Category` | Groups products (e.g. Laptops, Phones). Has `name` and `slug`. |
| `Product` | Core item in the store. See §4 for full field breakdown. |
| `Review` | User review linked to a product (rating + comment). One per user per product. |
| `Cart` | One cart per user (OneToOne). Acts as a container. |
| `CartItem` | Individual product + quantity inside a cart. |
| `Order` | Created when the user proceeds to checkout. Has a status lifecycle. |
| `OrderItem` | Snapshot of a product purchased in an order (preserves name/price even if product deleted). |
| `Payment` | Linked to an order + Stripe session ID. Tracks payment status. |
| `Address` | Saved shipping addresses per user. Supports multiple with a default flag. |
| `ContactMessage` | Messages submitted via the contact form. |

### 3.2 Order Status Lifecycle

```
PENDING → PAID → SHIPPED → DELIVERED
```

- `PENDING` is set when the order is created.
- `PAID` is set when Stripe confirms payment (via webhook in production, or immediately after session creation in development).
- `SHIPPED` / `DELIVERED` are set manually by an admin.

### 3.3 Key Views

| View | Route | What it does |
|---|---|---|
| `ProductViewSet` | `/api/products/` | CRUD + search + AI insight + featured + recommendations |
| `CartView` | `/api/cart/` | GET/POST/PATCH/DELETE cart items |
| `StripeCheckoutSessionView` | `/api/checkout/stripe/` | Creates order, deducts stock, clears cart, creates Stripe session |
| `StripeWebhookView` | `/api/payments/stripe/webhook/` | Handles Stripe payment confirmation (production) |
| `ProfileView` | `/api/profile/` | GET + PATCH user profile fields |
| `AddressViewSet` | `/api/addresses/` | CRUD for saved shipping addresses |

### 3.4 AI Integration

**AI Search** (`search.py`):
- When a user types a search query, `apply_smart_search()` is called.
- It sends the query + store context to Gemini and asks for structured JSON filters (category, price range, sort, keywords).
- If Gemini is unavailable, it falls back to keyword matching with fuzzy search.

**AI Product Insight** (`views.py` → `ai_insight` action):
- When a user clicks "Why this product?", the frontend calls `GET /api/products/{id}/ai-insight/`.
- The backend sends product details to Gemini and asks for a 3-4 sentence buyer-focused analysis.
- The result is returned as plain text and displayed in the `WhyModal`.

---

## 4. Product Model — Field Reference

```python
Product
├── category          ForeignKey → Category
├── name              CharField (max 200)
├── slug              SlugField (unique URL identifier)
├── description       TextField (full product description)
├── price             DecimalField (e.g. 1299.99)
├── stock             PositiveIntegerField (available units)
├── rating            DecimalField (1.00 – 5.00, e.g. 4.75)
├── image             URLField (Unsplash or any direct image URL)
├── specs             JSONField (key-value pairs, see below)
├── featured          BooleanField (shown in homepage featured section)
└── performance_score PositiveIntegerField (0–100, shown in AI modal)
```

### `specs` Field Format

The `specs` field is a JSON object with arbitrary string key-value pairs:

```json
{
  "CPU": "12-core M3",
  "RAM": "32GB",
  "Storage": "1TB SSD",
  "Display": "16-inch Retina",
  "Battery": "22 hours"
}
```

The keys and values are completely flexible — you can define any relevant specifications per product category.

---

## 5. Frontend Structure

### 5.1 State Management (Zustand)

`useStore.js` holds global client-side state:

```
useStore {
  cart[]          → Array of CartItem objects from server
  cartCount       → Total quantity (sum of all item.quantity)
  authUser        → Username string (from localStorage)
  compare[]       → Up to 3 products being compared
  searchTerm      → Current search input
}
```

### 5.2 API Layer

All API calls go through `src/api/client.js` which is an Axios instance pointing to `/api`. It automatically attaches the JWT Authorization header from localStorage on every request, and removes the token if it's expired.

```
api/
├── client.js     → Axios base + JWT interceptor
├── auth.js       → login(), register(), logout()
├── products.js   → getProducts(), getProductById(), getFeatured(),
│                   getRecommended(), getSuggestions(), getAIInsight()
└── commerce.js   → getCart(), addCartItem(), updateCartItem(), removeCartItem(),
                    createStripeCheckout(), getOrders(), getOrderById(),
                    getProfile(), updateProfile(),
                    getAddresses(), createAddress(), updateAddress(), deleteAddress()
```

### 5.3 Routing

| Path | Page |
|---|---|
| `/` | `HomePage` — Hero, featured, recommended marquee |
| `/products` | `ProductsPage` — Catalog with filters |
| `/products/:id` | `ProductDetailsPage` — Detail + AI modal + reviews |
| `/cart` | `CartPage` |
| `/checkout` | `CheckoutPage` — Shipping form + Stripe button |
| `/checkout/success` | `CheckoutSuccessPage` — Clears cart, shows order |
| `/checkout/cancel` | `CheckoutCancelPage` |
| `/account` | `AccountPage` — Orders, profile, addresses |
| `/compare` | `ComparePage` |
| `/contact` | `ContactPage` |
| `/login` | `LoginPage` |
| `/register` | `RegisterPage` |

---

## 6. Checkout Flow (Detailed)

```
1. User adds items to cart (POST /api/cart/)
2. User navigates to /checkout
3. Page loads existing cart from server (GET /api/cart/)
4. User fills in shipping info and clicks "Pay with Stripe"
5. Frontend calls POST /api/checkout/stripe/ with shipping_address
6. Backend (inside a DB transaction):
      a. Validates cart items and stock
      b. Creates Order with status=PENDING
      c. Creates OrderItem for each cart item (snapshot prices)
      d. Deducts stock from each product immediately
      e. Clears all cart items
      f. Creates Stripe session with success_url and cancel_url
      g. Creates Payment record with status=PENDING
7. Backend returns { url, order_id }
8. Frontend redirects browser to Stripe's hosted checkout page
9. User completes payment on Stripe
10. Stripe redirects user to /checkout/success?order_id=X
11. CheckoutSuccessPage mounts → clears Zustand cart state
12. Stripe also fires webhook → backend sets Payment.status=PAID and Order.status=PAID
```

---

## 7. Management Commands

### `python manage.py seed`

Populates the database with 8 categories and 20 products.

**Options:**
- `--clear` → Wipes existing products and categories first
- `--admin` → Creates `admin` superuser with password `admin123`

**Product categories seeded:**
- Laptops (4 products)
- Phones (3 products)
- Headphones (3 products)
- Monitors (3 products)
- Keyboards (2 products)
- Cameras (2 products)
- Tablets (2 products)
- Accessories (2 products)

### `python manage.py update_images`

Assigns real Unsplash image URLs to all products based on their category. Safe to re-run anytime.

---

## 8. Authentication

- JWT tokens are generated via `/api/auth/token/` (login).
- Access tokens expire in **30 minutes**.
- Refresh tokens expire in **7 days**.
- The Axios client checks token expiry before every request and removes it automatically if expired.
- `authUser` in Zustand stores the username string. A user is considered logged in if `localStorage.getItem("accessToken")` is non-null.
