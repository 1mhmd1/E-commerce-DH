import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { cartCountFromPayload, getCart, removeCartItem, updateCartItem } from "../api/commerce";
import useScrollReveal from "../hooks/useScrollReveal";

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
);
const IconMinus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

export default function CartPage() {
  const navigate = useNavigate();
  const cart = useStore((s) => s.cart);
  const setCart = useStore((s) => s.setCart);
  const setCartCount = useStore((s) => s.setCartCount);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useScrollReveal();

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) { setError("signin"); setCart([]); setCartCount(0); setLoading(false); return; }
      try {
        const payload = await getCart();
        setCart(payload.items || []);
        setCartCount(cartCountFromPayload(payload));
      } catch { setError("Could not load cart. Please login again."); }
      finally { setLoading(false); }
    };
    load();
  }, [setCart, setCartCount]);

  const total = useMemo(() =>
    cart.reduce((sum, item) => sum + Number(item?.product?.price || 0) * Number(item.quantity || 0), 0),
  [cart]);

  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [cart]);

  const handleQty = async (itemId, quantity) => {
    try {
      const payload = await updateCartItem({ item_id: itemId, quantity: Math.max(1, Number(quantity)) });
      setCart(payload.items || []);
      setCartCount(cartCountFromPayload(payload));
    } catch { setError("Failed to update quantity."); }
  };

  const handleRemove = async (itemId) => {
    try {
      const payload = await removeCartItem({ item_id: itemId });
      setCart(payload.items || []);
      setCartCount(cartCountFromPayload(payload));
    } catch { setError("Failed to remove item."); }
  };

  if (error === "signin") {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1rem" }} data-reveal>
        <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</p>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F0EBE1", marginBottom: "0.5rem" }}>Sign in to view your cart</h2>
        <p style={{ color: "#7A8499", marginBottom: "1.5rem" }}>Your cart is saved to your account so you can pick up where you left off.</p>
        <button className="btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Cart Items */}
      <section className="space-y-3 lg:col-span-2" data-reveal>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <h2 className="section-title">Shopping Cart</h2>
          <span style={{ fontSize: "0.8125rem", color: "#7A8499" }}>{itemCount} items</span>
        </div>

        {error && error !== "signin" && <div className="alert-error">{error}</div>}

        {!loading && cart.length === 0 && (
          <div className="surface-elevated" style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
            <p style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📦</p>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#F0EBE1", marginBottom: "0.4rem" }}>Your cart is empty</h3>
            <p style={{ color: "#7A8499", fontSize: "0.875rem", marginBottom: "1.25rem" }}>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        )}

        <AnimatePresence>
          {!loading && cart.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: "#161B27", border: "1px solid #252D3E", borderRadius: "1.25rem",
                padding: "1rem", display: "flex", alignItems: "center", gap: "1rem",
              }}
            >
              {/* Product Image */}
              <div style={{
                width: 80, height: 80, borderRadius: "0.875rem", overflow: "hidden", flexShrink: 0,
                background: "#0F1117",
              }}>
                <img src={item?.product?.image} alt={item?.product?.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              {/* Product Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0EBE1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item?.product?.name}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#7A8499", marginTop: "0.15rem" }}>
                  ${item?.product?.price} each
                </p>
              </div>

              {/* Quantity Stepper */}
              <div style={{
                display: "flex", alignItems: "center", gap: "0", borderRadius: "0.75rem",
                border: "1px solid #252D3E", overflow: "hidden",
              }}>
                <button onClick={() => handleQty(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  style={{
                    width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#0F1117", border: "none", color: "#7A8499", cursor: "pointer",
                    transition: "color 0.2s",
                  }}>
                  <IconMinus />
                </button>
                <span style={{
                  width: 38, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.875rem", fontWeight: 700, color: "#F0EBE1", background: "#0F1117",
                  borderLeft: "1px solid #252D3E", borderRight: "1px solid #252D3E",
                }}>
                  {item.quantity}
                </span>
                <button onClick={() => handleQty(item.id, item.quantity + 1)}
                  style={{
                    width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#0F1117", border: "none", color: "#7A8499", cursor: "pointer",
                  }}>
                  <IconPlus />
                </button>
              </div>

              {/* Line Total */}
              <p style={{ fontWeight: 700, color: "#4BB543", fontSize: "0.9375rem", minWidth: 70, textAlign: "right" }}>
                ${(Number(item?.product?.price || 0) * item.quantity).toFixed(2)}
              </p>

              {/* Remove */}
              <button onClick={() => handleRemove(item.id)}
                style={{
                  width: 34, height: 34, borderRadius: "0.5rem", display: "flex", alignItems: "center",
                  justifyContent: "center", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                  color: "#EF4444", cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
                }}>
                <IconTrash />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      {/* Order Summary */}
      <aside data-reveal>
        <div className="surface-elevated" style={{ padding: "1.5rem", position: "sticky", top: "5rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#F0EBE1", marginBottom: "1rem" }}>Order Summary</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#7A8499" }}>
              <span>Subtotal ({itemCount} items)</span>
              <span style={{ color: "#F0EBE1" }}>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#7A8499" }}>
              <span>Shipping</span>
              <span style={{ color: "#10B981", fontWeight: 600 }}>Free</span>
            </div>
            <hr className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.125rem", fontWeight: 800 }}>
              <span style={{ color: "#F0EBE1" }}>Total</span>
              <span style={{ color: "#4BB543" }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <Link to="/checkout" className="btn-primary" style={{
            width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.9375rem",
            textDecoration: "none", display: "flex",
          }}>
            Proceed to Checkout →
          </Link>

          <Link to="/products" style={{
            display: "block", textAlign: "center", color: "#7A8499", fontSize: "0.8125rem",
            marginTop: "0.75rem", textDecoration: "none", transition: "color 0.2s",
          }}>
            ← Continue Shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
