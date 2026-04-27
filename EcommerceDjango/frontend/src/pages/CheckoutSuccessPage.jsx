import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getOrderById } from "../api/commerce";
import { useStore } from "../store/useStore";

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  // Clear frontend cart state when landing on success page
  const setCart = useStore((s) => s.setCart);
  const setCartCount = useStore((s) => s.setCartCount);
  const clearCart = useStore((s) => s.clearCart);

  useEffect(() => {
    // Immediately clear the cart in the UI + store
    clearCart();
    setCartCount(0);
  }, [clearCart, setCartCount]);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId)
      .then(setOrder)
      .catch(() => setError("Could not load order status yet. Please check My Account."));
  }, [orderId]);

  return (
    <div style={{
      maxWidth: 520, margin: "0 auto", padding: "2rem 1rem", textAlign: "center",
    }}>
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        style={{
          width: 96, height: 96, borderRadius: "50%", margin: "0 auto 1.5rem",
          background: "rgba(75,181,67,0.12)", border: "2px solid rgba(75,181,67,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.5rem",
        }}
      >
        ✅
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ fontSize: "1.875rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}
      >
        Payment Successful!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        style={{ color: "#9E9E9E", marginBottom: "1.5rem", lineHeight: 1.6 }}
      >
        Thank you for your purchase. Your order has been confirmed and is being processed.
      </motion.p>

      {error && (
        <p style={{ color: "#F59E0B", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>
      )}

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: "#111", border: "1px solid #222", borderRadius: "1.25rem",
            padding: "1.25rem", marginBottom: "1.5rem", textAlign: "left",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <p style={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>Order #{order.id}</p>
            <span style={{
              padding: "0.2rem 0.65rem", borderRadius: "99px",
              fontSize: "0.6875rem", fontWeight: 700, textTransform: "capitalize",
              color: "#4BB543", background: "rgba(75,181,67,0.12)", border: "1px solid rgba(75,181,67,0.28)",
            }}>
              {order.status}
            </span>
          </div>
          {order.items?.map((item) => (
            <p key={item.id} style={{ fontSize: "0.8125rem", color: "#9E9E9E", marginBottom: "2px" }}>
              {item.product_name_snapshot} × {item.quantity}
            </p>
          ))}
          <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #222", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.875rem", color: "#9E9E9E" }}>Total</span>
            <span style={{ fontWeight: 800, color: "#4BB543" }}>${order.total}</span>
          </div>
        </motion.div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <Link to="/products" className="btn-primary">
          🛒 Continue Shopping
        </Link>
        <Link to="/account" className="btn-secondary">
          View Orders
        </Link>
      </div>
    </div>
  );
}
