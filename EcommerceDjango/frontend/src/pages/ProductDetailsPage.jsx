import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getProductById, getProducts } from "../api/products";
import { useStore } from "../store/useStore";
import { useToastStore } from "../store/useToastStore";
import { addCartItem, cartCountFromPayload } from "../api/commerce";

/* ── Icons ───────────────────────────────────────── */
const IconBag = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconStar = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#FFC107" : "none"} stroke="#FFC107" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

/* ── Star Rating Row ─────────────────────────────── */
function StarRating({ rating }) {
  const full = Math.round(rating || 0);
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} filled={i < full} />
      ))}
    </span>
  );
}

/* ── Related Product Mini-Card ───────────────────── */
function RelatedCard({ product }) {
  const navigate  = useNavigate();
  const setCart   = useStore((s) => s.setCart);
  const setCartCount = useStore((s) => s.setCartCount);
  const addToast  = useToastStore((s) => s.addToast);
  const addToCompare = useStore((s) => s.addToCompare);

  const handleBuy = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("accessToken");
    if (!token) { navigate("/login"); return; }
    try {
      const payload = await addCartItem({ product_id: product.id, quantity: 1 });
      setCart(payload.items || []);
      setCartCount(cartCountFromPayload(payload));
      addToast(`${product.name} added to cart!`);
    } catch {
      addToast("Could not add to cart.", "error");
    }
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      style={{
        minWidth: "160px",
        width: "160px",
        background: "#F8F9FA",
        borderRadius: "1.25rem",
        overflow: "hidden",
        cursor: "pointer",
        flexShrink: 0,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 14px 32px rgba(75,181,67,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)"; }}
    >
      {/* image */}
      <div style={{ height: "100px", overflow: "hidden" }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        />
      </div>

      {/* body */}
      <div style={{ padding: "0.6rem 0.75rem 0.75rem" }}>
        {/* stars */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
          <StarRating rating={product.rating} />
          <span style={{ fontSize: "0.65rem", color: "#888" }}>({product.rating})</span>
        </div>

        {/* name */}
        <p style={{
          fontSize: "0.76rem", fontWeight: 700, color: "#222",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          marginBottom: "2px",
        }}>
          {product.name}
        </p>

        {/* price */}
        <p style={{ fontSize: "0.8rem", fontWeight: 800, color: "#388E3C", marginBottom: "6px" }}>
          ${product.price}
        </p>

        {/* actions */}
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={handleBuy}
            disabled={product.stock === 0}
            style={{
              flex: 1, padding: "0.3rem 0.4rem", borderRadius: "999px", border: "none",
              background: "#4BB543", color: "#fff", fontWeight: 700, fontSize: "0.68rem",
              cursor: product.stock === 0 ? "not-allowed" : "pointer",
              opacity: product.stock === 0 ? 0.5 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "3px",
            }}
          >
            <IconBag /> Buy
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); addToCompare(product); }}
            style={{
              padding: "0.3rem 0.5rem", borderRadius: "999px",
              border: "1px solid #DDD", background: "#fff", color: "#555",
              fontWeight: 600, fontSize: "0.68rem", cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────── */
export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct]  = useState(null);
  const [related, setRelated]  = useState([]);
  const [activeImg, setActiveImg] = useState(0);

  const compare     = useStore((s) => s.compare);
  const addToCompare = useStore((s) => s.addToCompare);
  const setCart     = useStore((s) => s.setCart);
  const setCartCount = useStore((s) => s.setCartCount);
  const addToast    = useToastStore((s) => s.addToast);

  useEffect(() => {
    (async () => {
      const data = await getProductById(id);
      setProduct(data);
      setActiveImg(0);
      const rel = await getProducts({ category: data.category.slug });
      setRelated(rel.results.filter((p) => p.id !== data.id).slice(0, 8));
    })();
  }, [id]);

  const isCompared = useMemo(
    () => compare.some((p) => p.id === Number(id)),
    [compare, id],
  );

  const handleAddToCart = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) { navigate("/login"); return; }
    try {
      const payload = await addCartItem({ product_id: product.id, quantity: 1 });
      setCart(payload.items || []);
      setCartCount(cartCountFromPayload(payload));
      addToast(`${product.name} added to cart!`);
    } catch {
      addToast("Could not add to cart.", "error");
    }
  };

  if (!product) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{
        width: "48px", height: "48px", borderRadius: "50%",
        border: "4px solid #222", borderTopColor: "#4BB543",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* Build a small "gallery": use the product image + repeat a couple times as placeholders */
  const images = [product.image, product.image, product.image, product.image];

  const specEntries = Object.entries(product.specs || {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

      {/* ── Breadcrumb ──────────────────────────────── */}
      <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#666" }}>
        <Link to="/" style={{ color: "#9E9E9E", textDecoration: "none" }}>Home</Link>
        <span>›</span>
        <Link to="/products" style={{ color: "#9E9E9E", textDecoration: "none" }}>Products</Link>
        <span>›</span>
        <span style={{ color: "#ccc" }}>{product.name}</span>
      </nav>

      {/* ── Main Layout ─────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: "1.5rem",
        alignItems: "start",
      }} className="product-detail-grid">

        {/* Left: Thumbnail Strip */}
        <div style={{
          display: "flex", flexDirection: "column", gap: "0.625rem",
        }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              style={{
                width: "68px", height: "68px", borderRadius: "0.875rem", overflow: "hidden",
                border: activeImg === i ? "2px solid #4BB543" : "2px solid transparent",
                background: "#1a1a1a", cursor: "pointer", padding: 0,
                transition: "border-color 0.2s ease, transform 0.2s ease",
                transform: activeImg === i ? "scale(1.05)" : "scale(1)",
              }}
            >
              <img src={img} alt={`View ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>

        {/* Center: Main Image */}
        <div style={{ position: "relative" }}>
          <div style={{
            borderRadius: "1.75rem", overflow: "hidden",
            background: "#111", maxHeight: "480px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img
              src={images[activeImg]}
              alt={product.name}
              style={{ width: "100%", height: "480px", objectFit: "cover", borderRadius: "1.75rem", display: "block" }}
            />
          </div>

          {/* Prev / Next arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
                style={arrowBtn}
              >
                <IconChevronLeft />
              </button>
              <button
                onClick={() => setActiveImg((p) => (p + 1) % images.length)}
                style={{ ...arrowBtn, right: "1rem", left: "auto" }}
              >
                <IconChevronRight />
              </button>
            </>
          )}
        </div>

        {/* Right: Product Info Panel */}
        <div style={{
          background: "#111", border: "1px solid #222", borderRadius: "1.5rem",
          padding: "1.75rem", minWidth: "300px", maxWidth: "340px",
          display: "flex", flexDirection: "column", gap: "0.875rem",
        }}>
          {/* Name */}
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>
              {product.name}
            </h1>
            {product.category && (
              <p style={{ fontSize: "0.8rem", color: "#9E9E9E", marginTop: "2px" }}>
                {product.category.name}
              </p>
            )}
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#4BB543" }}>
              ${product.price}
            </span>
            <span style={{ fontSize: "0.8rem", color: "#666", textDecoration: "line-through" }}>
              ${(parseFloat(product.price) * 1.2).toFixed(2)}
            </span>
          </div>

          {/* Description label */}
          {specEntries.length > 0 ? (
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4BB543", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                About this item:
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {specEntries.map(([k, v]) => (
                  <li key={k} style={{ fontSize: "0.8125rem", color: "#ccc" }}>
                    <strong style={{ color: "#fff" }}>{k}</strong>: {v}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ fontSize: "0.875rem", color: "#9E9E9E", lineHeight: 1.6 }}>
              {product.description}
            </p>
          )}

          {/* Stock badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.7rem",
              borderRadius: "999px",
              background: product.stock > 0 ? "rgba(75,181,67,0.12)" : "rgba(239,68,68,0.12)",
              color: product.stock > 0 ? "#4BB543" : "#EF4444",
              border: `1px solid ${product.stock > 0 ? "rgba(75,181,67,0.3)" : "rgba(239,68,68,0.3)"}`,
            }}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <StarRating rating={product.rating} />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>{product.rating}</span>
            <span style={{ fontSize: "0.75rem", color: "#666" }}>· {product.stock} Reviews</span>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #222" }} />

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.8rem 1.5rem", borderRadius: "999px", border: "none",
                background: "#4BB543", color: "#fff", fontWeight: 700, fontSize: "0.9375rem",
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                opacity: product.stock === 0 ? 0.5 : 1,
                transition: "all 0.25s ease",
                boxShadow: "0 4px 20px rgba(75,181,67,0.25)",
              }}
              onMouseEnter={e => { if (product.stock > 0) { e.currentTarget.style.background = "#66BB6A"; e.currentTarget.style.transform = "scale(1.03)"; }}}
              onMouseLeave={e => { e.currentTarget.style.background = "#4BB543"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <IconBag /> Add to Cart
            </button>
            <button
              onClick={() => addToCompare(product)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0.7rem 1.5rem", borderRadius: "999px",
                border: `1px solid ${isCompared ? "#4BB543" : "#333"}`,
                background: "transparent",
                color: isCompared ? "#4BB543" : "#9E9E9E",
                fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            >
              {isCompared ? "✓ Compared" : "Add to Compare"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Reviews Section ──────────────────────────── */}
      {(product.reviews || []).length > 0 && (
        <section style={{
          background: "#111", border: "1px solid #222",
          borderRadius: "1.5rem", padding: "1.5rem",
        }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1.125rem", fontWeight: 700, color: "#fff" }}>
            Reviews
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {product.reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  background: "#1a1a1a", border: "1px solid #222",
                  borderRadius: "1rem", padding: "0.875rem 1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>{review.user.username}</span>
                  <StarRating rating={review.rating} />
                </div>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#9E9E9E" }}>{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Related Products ─────────────────────────── */}
      {related.length > 0 && (
        <section>
          <h2 style={{
            fontSize: "1.5rem", fontWeight: 800, color: "#fff",
            letterSpacing: "-0.02em", marginBottom: "1.25rem",
          }}>
            RELATED
          </h2>
          <div style={{
            display: "flex",
            gap: "1rem",
            overflowX: "auto",
            paddingBottom: "1rem",
            scrollbarWidth: "thin",
            scrollbarColor: "#333 transparent",
          }}>
            {related.map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Responsive styles ────────────────────────── */}
      <style>{`
        .product-detail-grid {
          grid-template-columns: auto 1fr auto;
        }
        @media (max-width: 900px) {
          .product-detail-grid {
            grid-template-columns: auto 1fr !important;
            grid-template-rows: auto auto;
          }
          .product-detail-grid > div:last-child {
            grid-column: 1 / -1;
            max-width: 100% !important;
          }
        }
        @media (max-width: 600px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .product-detail-grid > div:first-child {
            flex-direction: row !important;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}

const arrowBtn = {
  position: "absolute", top: "50%", left: "1rem",
  transform: "translateY(-50%)",
  width: "36px", height: "36px",
  borderRadius: "50%", border: "1px solid #333",
  background: "rgba(0,0,0,0.6)", color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", backdropFilter: "blur(4px)",
  transition: "background 0.2s ease, border-color 0.2s ease",
  zIndex: 2,
};
