import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getOrders } from "../api/commerce";

/* Icons */
const IconUser    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconBag     = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IconHeart   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconShield  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconChevron = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

const sections = [
  { key: "profile",  label: "Profile",   icon: <IconUser />,   desc: "Manage identity & preferences" },
  { key: "orders",   label: "Orders",    icon: <IconBag />,    desc: "Track order statuses" },
  { key: "wishlist", label: "Wishlist",  icon: <IconHeart />,  desc: "Your saved products" },
  { key: "security", label: "Security",  icon: <IconShield />, desc: "Password & session settings" },
];

function StatusPill({ status }) {
  const map = {
    pending:    { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.28)" },
    processing: { color: "#6366F1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.28)" },
    shipped:    { color: "#14B8A6", bg: "rgba(20,184,166,0.12)", border: "rgba(20,184,166,0.28)" },
    delivered:  { color: "#10B981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.28)" },
    cancelled:  { color: "#F43F5E", bg: "rgba(244,63,94,0.12)",  border: "rgba(244,63,94,0.28)" },
  };
  const style = map[status?.toLowerCase()] || map.pending;
  return (
    <span style={{
      padding: "0.2rem 0.65rem",
      borderRadius: "99px",
      fontSize: "0.6875rem",
      fontWeight: 600,
      textTransform: "capitalize",
      color: style.color,
      background: style.bg,
      border: `1px solid ${style.border}`,
    }}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [active, setActive] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [error,  setError]  = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      if (!localStorage.getItem("accessToken")) return;
      try {
        const payload = await getOrders();
        setOrders(payload.results || payload || []);
      } catch { setError("Could not load orders."); }
    };
    loadOrders();
  }, []);

  const authUser = localStorage.getItem("authUser") || "User";
  const initials = authUser.slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Header */}
      <div style={{
        background: "#161B27", border: "1px solid #252D3E", borderRadius: "1.25rem",
        padding: "1.25rem 1.5rem", marginBottom: "1.25rem",
        display: "flex", alignItems: "center", gap: "1rem",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "rgba(245,158,11,0.15)", border: "2px solid rgba(245,158,11,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#F59E0B", fontWeight: 700, fontSize: "1.1rem", flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <p className="section-eyebrow">Dashboard</p>
          <h1 className="section-title" style={{ marginTop: "0.1rem" }}>Welcome back, {authUser}</h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1.25rem", alignItems: "start" }}>

        {/* Sidebar */}
        <aside className="dashboard-panel" style={{ padding: "1.125rem", position: "sticky", top: "80px" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {sections.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`dashboard-nav${active === key ? " dashboard-nav-active" : ""}`}
              >
                <span style={{ opacity: active === key ? 1 : 0.6, transition: "opacity 0.2s", display: "flex" }}>{icon}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
                <span style={{ opacity: 0.35, display: "flex" }}><IconChevron /></span>
              </button>
            ))}
          </nav>

          <hr className="divider" style={{ margin: "1rem 0" }} />

          <div style={{
            background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)",
            borderRadius: "0.75rem", padding: "0.75rem", fontSize: "0.8125rem", color: "#6EE7B7",
            display: "flex", alignItems: "flex-start", gap: "0.5rem",
          }}>
            <IconShield />
            <span>Secure · Encrypted data</span>
          </div>
        </aside>

        {/* Main content */}
        <section>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem", marginBottom: "1.25rem" }}>
            {[
              { label: "Total orders", value: orders.length, icon: <IconBag />,   color: "#F59E0B" },
              { label: "Account status", value: "Active",  icon: <IconUser />,   color: "#10B981" },
              { label: "Security",       value: "Protected", icon: <IconShield />, color: "#6366F1" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: "0.75rem", color: "#7A8499", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
                  <div style={{
                    width: 32, height: 32, borderRadius: "8px",
                    background: `${color}18`, color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {icon}
                  </div>
                </div>
                <p style={{ fontSize: "1.625rem", fontWeight: 800, color: "#F0EBE1", letterSpacing: "-0.02em" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Section panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="dashboard-panel"
            >
              <div style={{ borderBottom: "1px solid #252D3E", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
                <p className="section-eyebrow">{sections.find(s => s.key === active)?.desc}</p>
                <h2 className="section-title" style={{ marginTop: "0.25rem", textTransform: "capitalize" }}>{active}</h2>
              </div>

              {active === "profile" && (
                <div className="dashboard-card">
                  <p style={{ fontWeight: 600, color: "#F0EBE1", marginBottom: "0.35rem" }}>Profile center</p>
                  <p style={{ color: "#7A8499", fontSize: "0.875rem" }}>
                    Manage your identity, address, and communication preferences.
                  </p>
                </div>
              )}

              {active === "wishlist" && (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💛</p>
                  <p style={{ fontWeight: 600, color: "#F0EBE1", marginBottom: "0.4rem" }}>Your wishlist is empty</p>
                  <p style={{ color: "#7A8499", fontSize: "0.875rem" }}>Save products to revisit purchasing options later.</p>
                </div>
              )}

              {active === "security" && (
                <div className="dashboard-card">
                  <p style={{ fontWeight: 600, color: "#F0EBE1", marginBottom: "0.35rem" }}>Security center</p>
                  <p style={{ color: "#7A8499", fontSize: "0.875rem" }}>
                    Rotate password regularly and review login activity for safety.
                  </p>
                </div>
              )}

              {active === "orders" && (
                <div>
                  {!localStorage.getItem("accessToken") && (
                    <div className="alert-info" style={{ marginBottom: "1rem" }}>
                      Please login to view your orders.{" "}
                      <button style={{ textDecoration: "underline", background: "none", border: "none", color: "inherit", cursor: "pointer" }} onClick={() => navigate("/login")}>
                        Go to login →
                      </button>
                    </div>
                  )}
                  {error && <div className="alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

                  {localStorage.getItem("accessToken") && orders.length === 0 && !error && (
                    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                      <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📦</p>
                      <p style={{ fontWeight: 600, color: "#F0EBE1", marginBottom: "0.4rem" }}>No orders yet</p>
                      <p style={{ color: "#7A8499", fontSize: "0.875rem" }}>Your order history will appear here.</p>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.875rem" }}>
                    {orders.map((order) => (
                      <div key={order.id} className="dashboard-card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
                          <span style={{ fontWeight: 700, color: "#F0EBE1", fontSize: "0.9375rem" }}>
                            Order #{order.id}
                          </span>
                          <StatusPill status={order.status} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "#7A8499" }}>
                          <span>Total</span>
                          <span style={{ fontWeight: 700, color: "#F59E0B" }}>${order.total}</span>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "#4A5568", marginTop: "0.3rem" }}>
                          {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
