import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { useToastStore } from "../store/useToastStore";
import { addCartItem, cartCountFromPayload } from "../api/commerce";

const IconBag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconCompare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="m21 3-7 7"/><path d="m3 3 7 7"/><path d="M16 21h5v-5"/><path d="M8 21H3v-5"/><path d="m21 21-7-7"/><path d="m3 21 7-7"/>
  </svg>
);

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const addToCompare = useStore((s) => s.addToCompare);
  const setCart = useStore((s) => s.setCart);
  const setCartCount = useStore((s) => s.setCartCount);
  const addToast = useToastStore((s) => s.addToast);

  const hasDiscount = product.discount_percent && product.discount_percent > 0;
  const discountedPrice = hasDiscount
    ? (parseFloat(product.price) * (1 - product.discount_percent / 100)).toFixed(2)
    : null;

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

  return (
    <div className="product-card" style={{ position: "relative" }}>
      {/* Discount Badge */}
      {hasDiscount && (
        <div style={{
          position: "absolute", top: "0.75rem", left: "0.75rem", zIndex: 10,
          background: "linear-gradient(135deg, #FF6B35, #E53E3E)",
          color: "#fff", fontWeight: 800, fontSize: "0.7rem",
          padding: "0.3rem 0.65rem", borderRadius: "999px",
          boxShadow: "0 2px 10px rgba(229,62,62,0.3)",
          letterSpacing: "0.03em",
          animation: "pulse 2s infinite",
        }}>
          −{product.discount_percent}% OFF
        </div>
      )}

      {/* Image */}
      <div className="product-image" style={{ height: "12rem" }}>
        <img src={product.image} alt={product.name} />
      </div>

      {/* Content on light background */}
      <div style={{ padding: "1rem 1.125rem 1.25rem", background: "#F8F9FA" }}>
        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.4rem" }}>
          <span style={{ color: "#FFC107", fontSize: "0.8125rem" }}>{"★".repeat(Math.round(product.rating || 4))}</span>
          <span style={{ fontSize: "0.7rem", color: "#888" }}>({product.rating})</span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: "0.9375rem", fontWeight: 700, color: "#333",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          marginBottom: "0.15rem",
        }}>
          {product.name}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: "0.75rem", color: "#888", marginBottom: "0.5rem",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {product.description}
        </p>

        {/* Price + Stock */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {hasDiscount ? (
              <>
                <p style={{ fontWeight: 800, color: "#E53E3E", fontSize: "1.125rem" }}>
                  ${discountedPrice}
                </p>
                <p style={{
                  fontWeight: 500, color: "#AAA", fontSize: "0.8rem",
                  textDecoration: "line-through",
                }}>
                  ${product.price}
                </p>
              </>
            ) : (
              <p style={{ fontWeight: 800, color: "#388E3C", fontSize: "1.125rem" }}>
                ${product.price}
              </p>
            )}
          </div>
          {product.stock !== undefined && (
            <span style={{
              fontSize: "0.65rem", fontWeight: 600, padding: "0.15rem 0.5rem",
              borderRadius: "999px",
              background: product.stock > 0 ? "rgba(75,181,67,0.1)" : "rgba(239,68,68,0.1)",
              color: product.stock > 0 ? "#388E3C" : "#EF4444",
            }}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button onClick={handleAddToCart} disabled={product.stock === 0}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
              padding: "0.5rem", borderRadius: "999px", border: "none",
              background: "#4BB543", color: "#fff", fontWeight: 700, fontSize: "0.8125rem",
              cursor: product.stock === 0 ? "not-allowed" : "pointer",
              opacity: product.stock === 0 ? 0.5 : 1,
              transition: "all 0.25s",
            }}>
            <IconBag /> Add to Cart
          </button>
          <button onClick={() => { addToCompare(product); addToast(`${product.name} added to compare`); }}
            title="Add to Compare"
            style={{
              padding: "0.5rem 0.6rem", borderRadius: "999px",
              border: "1px solid #DDD", background: "#fff", color: "#555",
              cursor: "pointer", transition: "all 0.25s",
              display: "flex", alignItems: "center",
            }}>
            <IconCompare />
          </button>
          <Link to={`/products/${product.id}`}
            style={{
              padding: "0.5rem 0.75rem", borderRadius: "999px",
              border: "1px solid #DDD", background: "#fff", color: "#555",
              fontWeight: 600, fontSize: "0.8125rem", textDecoration: "none",
              transition: "all 0.25s", display: "flex", alignItems: "center",
            }}>
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
