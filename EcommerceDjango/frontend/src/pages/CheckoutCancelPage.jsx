import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

const IconX = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

export default function CheckoutCancelPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "65vh" }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "#161B27", border: "1px solid #252D3E", borderRadius: "1.5rem",
          padding: "3rem", width: "100%", maxWidth: "520px", textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{
          width: 80, height: 80, background: "rgba(75,181,67,0.12)", color: "#4BB543",
          border: "2px solid rgba(75,181,67,0.25)", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.5rem",
        }}>
          <IconX />
        </div>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#F0EBE1", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
          Payment cancelled
        </h1>
        <p style={{ color: "#7A8499", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          The Stripe checkout session was cancelled. No charges were made. You can try again whenever you're ready.
        </p>

        {orderId && (
          <p style={{ fontSize: "0.8125rem", color: "#4A5568", marginBottom: "1.5rem" }}>
            Reference: <strong style={{ color: "#7A8499" }}>#{orderId}</strong>
          </p>
        )}

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/checkout" className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "0.875rem" }}>
            Back to checkout
          </Link>
          <Link to="/cart" className="btn-secondary" style={{ flex: 1, justifyContent: "center", padding: "0.875rem" }}>
            Back to cart
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
