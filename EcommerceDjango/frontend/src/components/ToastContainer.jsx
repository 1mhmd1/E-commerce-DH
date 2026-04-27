import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "../store/useToastStore";

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div style={{
      position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999,
      display: "flex", flexDirection: "column", gap: "0.5rem", pointerEvents: "none",
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              pointerEvents: "auto",
              display: "flex", alignItems: "center", gap: "0.625rem",
              padding: "0.75rem 1.25rem", borderRadius: "999px",
              background: toast.type === "error" ? "rgba(239,68,68,0.12)" : "rgba(75,181,67,0.12)",
              border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.25)" : "rgba(75,181,67,0.3)"}`,
              backdropFilter: "blur(12px)",
              color: toast.type === "error" ? "#FCA5A5" : "#66BB6A",
              fontSize: "0.875rem", fontWeight: 600,
              boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0,
              background: toast.type === "error" ? "rgba(239,68,68,0.2)" : "rgba(75,181,67,0.2)",
            }}>
              {toast.type === "error" ? "✕" : "✓"}
            </span>
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
