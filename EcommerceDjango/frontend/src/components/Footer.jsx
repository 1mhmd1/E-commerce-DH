export default function Footer() {
  return (
    <footer style={{
      marginTop: "2.5rem", borderTop: "1px solid #222",
      background: "#0A0A0A", padding: "2rem 0",
    }}>
      <div className="container-shell" style={{
        display: "flex", flexDirection: "column", gap: "0.5rem",
        alignItems: "center", textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "1rem" }}>🌿</span>
          <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#4BB543" }}>EcoShop</span>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "#555" }}>
          Sustainable shopping, powered by AI • © {new Date().getFullYear()}
        </p>
        <p style={{ fontSize: "0.6875rem", color: "#333", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Premium Eco-Friendly Commerce
        </p>
      </div>
    </footer>
  );
}
