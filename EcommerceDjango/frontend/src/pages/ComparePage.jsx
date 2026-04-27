import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store/useStore";
import { getCompareRecommendation } from "../api/products";

const specsToCompare = ["price", "rating", "RAM", "CPU"];

export default function ComparePage() {
  const compare = useStore((s) => s.compare);
  const removeFromCompare = useStore((s) => s.removeFromCompare);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bestValues = useMemo(() => {
    if (!compare.length) return {};
    const cpuRank = {
      i3: 1, "ryzen 3": 1,
      i5: 2, "ryzen 5": 2,
      i7: 3, "ryzen 7": 3,
      i9: 4, "ryzen 9": 4,
    };
    const cpuScore = (cpu = "") => {
      const normalized = String(cpu).toLowerCase();
      return Object.entries(cpuRank).find(([k]) => normalized.includes(k))?.[1] || 0;
    };

    return {
      price: Math.min(...compare.map((p) => Number(p.price))),
      rating: Math.max(...compare.map((p) => Number(p.rating))),
      RAM: Math.max(...compare.map((p) => Number((p.specs?.RAM || "0").replace("GB", "")))),
      CPU: Math.max(...compare.map((p) => cpuScore(p.specs?.CPU))),
    };
  }, [compare]);

  const handleGetRecommendation = async () => {
    if (compare.length < 2) return;
    setLoading(true);
    setError("");
    setRecommendation(null);
    try {
      const data = await getCompareRecommendation(compare.map((p) => p.id));
      setRecommendation(data.recommendation);
    } catch {
      setError("Could not get AI recommendation. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (compare.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "4rem 2rem",
      }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⚖️</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F0EBE1", marginBottom: "0.5rem" }}>
          No products to compare
        </h2>
        <p style={{ fontSize: "0.9rem", color: "#7A8499" }}>
          Add 2-3 products from the catalog using the compare button to see them side by side.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div className="surface-elevated" style={{ padding: "1.5rem 2rem" }}>
        <p className="section-eyebrow">Side-by-Side Analysis</p>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#F0EBE1", marginTop: "0.25rem" }}>
          Compare Products
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#7A8499", marginTop: "0.25rem" }}>
          {compare.length} of 3 products selected
        </p>
      </div>

      {/* Product Cards Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${compare.length}, 1fr)`,
        gap: "1rem",
      }}>
        {compare.map((product) => (
          <div key={product.id} className="surface-elevated" style={{
            padding: "1.25rem", textAlign: "center", position: "relative",
          }}>
            <button
              onClick={() => removeFromCompare(product.id)}
              style={{
                position: "absolute", top: "0.75rem", right: "0.75rem",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "999px", padding: "0.25rem 0.6rem",
                color: "#FCA5A5", fontSize: "0.7rem", fontWeight: 600,
                cursor: "pointer", transition: "all 0.25s",
              }}
            >
              ✕ Remove
            </button>
            {product.image && (
              <img src={product.image} alt={product.name} style={{
                width: "100%", height: "8rem", objectFit: "cover",
                borderRadius: "1rem", marginBottom: "0.75rem",
              }} />
            )}
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#F0EBE1", marginBottom: "0.25rem" }}>
              {product.name}
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#7A8499" }}>
              {product.category?.name || "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="surface-elevated" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", textAlign: "left", fontSize: "0.875rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #222" }}>
              <th style={{ padding: "1rem 1.25rem", color: "#7A8499", fontWeight: 600 }}>Metric</th>
              {compare.map((product) => (
                <th key={product.id} style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "#F0EBE1" }}>
                  {product.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specsToCompare.map((metric) => (
              <tr key={metric} style={{ borderBottom: "1px solid #1A1A1A" }}>
                <td style={{ padding: "0.875rem 1.25rem", color: "#7A8499", fontWeight: 500, textTransform: "capitalize" }}>
                  {metric}
                </td>
                {compare.map((product) => {
                  const value =
                    metric === "price"
                      ? Number(product.price)
                      : metric === "rating"
                        ? Number(product.rating)
                        : product.specs?.[metric];
                  const cpuRank = {
                    i3: 1, "ryzen 3": 1, i5: 2, "ryzen 5": 2,
                    i7: 3, "ryzen 7": 3, i9: 4, "ryzen 9": 4,
                  };
                  const cpuScore = (cpu = "") => {
                    const normalized = String(cpu).toLowerCase();
                    return Object.entries(cpuRank).find(([k]) => normalized.includes(k))?.[1] || 0;
                  };
                  const highlight =
                    (metric === "price" && value === bestValues.price) ||
                    (metric === "rating" && value === bestValues.rating) ||
                    (metric === "RAM" && Number((value || "0").replace("GB", "")) === bestValues.RAM) ||
                    (metric === "CPU" && cpuScore(value) === bestValues.CPU && bestValues.CPU > 0);
                  return (
                    <td
                      key={product.id + metric}
                      style={{
                        padding: "0.875rem 1.25rem",
                        fontWeight: highlight ? 700 : 400,
                        color: highlight ? "#4BB543" : "#F0EBE1",
                        background: highlight ? "rgba(75,181,67,0.08)" : "transparent",
                        borderRadius: highlight ? "0.5rem" : "0",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {metric === "price" ? `$${value}` : value || "—"}
                      {highlight && " ✓"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Recommendation Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        {compare.length >= 2 && (
          <button
            onClick={handleGetRecommendation}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.85rem 2rem",
              background: loading
                ? "rgba(75,181,67,0.3)"
                : "linear-gradient(135deg, #4BB543, #388E3C)",
              color: "#fff", fontWeight: 800, fontSize: "0.9375rem",
              border: "none", borderRadius: "999px",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 20px rgba(75,181,67,0.3)",
              transition: "all 0.3s ease",
              letterSpacing: "0.01em",
            }}
          >
            {loading ? (
              <>
                <span style={{
                  display: "inline-block", width: "1rem", height: "1rem",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                Analyzing products...
              </>
            ) : (
              <>🤖 Get AI Recommendation</>
            )}
          </button>
        )}

        {error && (
          <div className="alert-error" style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}>
            {error}
          </div>
        )}

        <AnimatePresence>
          {recommendation && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                maxWidth: "700px", width: "100%",
                background: "linear-gradient(135deg, rgba(75,181,67,0.06) 0%, rgba(0,0,0,0) 100%)",
                border: "1px solid rgba(75,181,67,0.25)",
                borderRadius: "1.5rem",
                padding: "1.75rem 2rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Glow effect */}
              <div style={{
                position: "absolute", top: "-50%", right: "-30%",
                width: "250px", height: "250px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(75,181,67,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🤖</span>
                <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#4BB543" }}>
                  AI Recommendation
                </h3>
              </div>
              <p style={{
                fontSize: "0.9375rem", lineHeight: 1.7,
                color: "#D4D0C8",
              }}>
                {recommendation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inline CSS for spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
