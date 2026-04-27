import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getAIInsight } from "../api/products";

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconBox = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);
const IconZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconBrain = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4BB543" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a8 8 0 0 0-8 8c0 3 1.5 5.5 4 7v3h8v-3c2.5-1.5 4-4 4-7a8 8 0 0 0-8-8z"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
  </svg>
);

export default function WhyModal({ open, onClose, product }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !product) return;
    setLoading(true);
    setError("");
    setInsight(null);

    getAIInsight(product.id)
      .then((data) => setInsight(data))
      .catch(() => setError("AI insight unavailable. Please try again later."))
      .finally(() => setLoading(false));
  }, [open, product?.id]);

  if (!product) return null;

  const stats = [
    { label: "Rating", value: insight?.rating ?? product.rating ?? "-", icon: <IconStar />, color: "#F59E0B" },
    { label: "In Stock", value: insight?.stock ?? product.stock ?? "-", icon: <IconBox />, color: "#4BB543" },
    { label: "Performance", value: insight?.performance_score ?? product.performance_score ?? "-", icon: <IconZap />, color: "#6366F1" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "grid", placeItems: "center",
            background: "rgba(0,0,0,0.70)",
            padding: "1rem",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.28 }}
            style={{
              width: "100%", maxWidth: "480px",
              background: "#111",
              border: "1px solid #222",
              borderRadius: "1.5rem",
              padding: "2rem",
              boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <IconBrain />
              <p style={{
                fontSize: "0.7rem", fontWeight: 700, color: "#4BB543",
                letterSpacing: "0.14em", textTransform: "uppercase", margin: 0,
              }}>
                AI Product Insight
              </p>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
              Why {product.name}?
            </h3>

            {/* Stat pills */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {stats.map(({ label, value, icon, color }) => (
                <div key={label} style={{
                  background: "#1a1a1a", border: "1px solid #222",
                  borderRadius: "0.875rem", padding: "0.875rem 0.75rem",
                  textAlign: "center",
                }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.375rem", color }}>{icon}</div>
                  <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff" }}>{value}</p>
                  <p style={{ fontSize: "0.7rem", color: "#9E9E9E", marginTop: "0.125rem" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* AI Insight Content */}
            <div style={{ minHeight: "80px", marginBottom: "1.5rem" }}>
              {loading && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "1.5rem 0" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    border: "3px solid #222", borderTopColor: "#4BB543",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  <p style={{ fontSize: "0.8125rem", color: "#9E9E9E" }}>
                    AI is analyzing this product...
                  </p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {error && (
                <p style={{ color: "#EF4444", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>
                  {error}
                </p>
              )}

              {insight && !loading && (
                <p style={{ color: "#ccc", fontSize: "0.875rem", lineHeight: 1.7 }}>
                  {insight.insight}
                </p>
              )}
            </div>

            <button
              className="btn-primary"
              onClick={onClose}
              style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
