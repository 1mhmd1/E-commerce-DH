import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login } from "../api/auth";
import { getCart, cartCountFromPayload } from "../api/commerce";
import { useStore } from "../store/useStore";

const IconEye     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IconArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

export default function LoginPage() {
  const navigate     = useNavigate();
  const setAuthUser  = useStore((s) => s.setAuthUser);
  const setCart      = useStore((s) => s.setCart);
  const setCartCount = useStore((s) => s.setCartCount);

  const [form, setForm]         = useState({ username: "", password: "" });
  const [showPwd, setShowPwd]   = useState(false);
  const [status, setStatus]     = useState({ loading: false, error: "" });

  const handleLogin = async () => {
    if (!form.username || !form.password) return;
    try {
      setStatus({ loading: true, error: "" });
      await login(form);
      setAuthUser(form.username);
      const cart = await getCart();
      setCart(cart.items || []);
      setCartCount(cartCountFromPayload(cart));
      navigate("/products");
    } catch {
      setStatus({ loading: false, error: "Invalid username or password." });
      return;
    }
    setStatus({ loading: false, error: "" });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "2rem 1rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "#161B27",
          border: "1px solid #252D3E",
          borderRadius: "1.5rem",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        {/* Logo mini */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          <div style={{
            width: 36, height: 36, background: "#4BB543", borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#F0EBE1" }}>
            Eco<span style={{ color: "#4BB543" }}>Shop</span>
          </span>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F0EBE1", letterSpacing: "-0.025em", marginBottom: "0.3rem" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#7A8499", marginBottom: "1.75rem" }}>
          Sign in to access your account.
        </p>

        {/* Demo credentials */}
        <div style={{
          background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.20)",
          borderRadius: "0.875rem", padding: "0.875rem 1rem", marginBottom: "1.5rem",
          fontSize: "0.8125rem",
        }}>
          <p style={{ fontWeight: 600, color: "#FCD34D", marginBottom: "0.35rem", fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Demo Credentials
          </p>
          <p style={{ color: "#7A8499" }}>
            <strong style={{ color: "#F0EBE1" }}>User:</strong> demo_user / DemoUser@123
          </p>
          <p style={{ color: "#7A8499", marginTop: "0.2rem" }}>
            <strong style={{ color: "#F0EBE1" }}>Admin:</strong> admin / Admin@12345
          </p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#7A8499", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.35rem" }}>
              Username
            </label>
            <input
              id="login-username"
              className="input-dark"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              onKeyDown={handleKeyDown}
              autoComplete="username"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#7A8499", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.35rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPwd ? "text" : "password"}
                className="input-dark"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                style={{ paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={{
                  position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "#4A5568", cursor: "pointer",
                  display: "flex", alignItems: "center", padding: 0, transition: "color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#7A8499"}
                onMouseLeave={e => e.currentTarget.style.color = "#4A5568"}
              >
                {showPwd ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>
        </div>

        {status.error && (
          <div className="alert-error" style={{ marginTop: "1rem" }}>
            {status.error}
          </div>
        )}

        <button
          id="login-submit"
          className="btn-primary"
          disabled={status.loading || !form.username || !form.password}
          onClick={handleLogin}
          style={{ width: "100%", justifyContent: "center", marginTop: "1.5rem", padding: "0.75rem", fontSize: "0.9375rem" }}
        >
          {status.loading ? (
            <>
              <div style={{ width: 16, height: 16, border: "2px solid #0F1117", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              Signing in…
            </>
          ) : (
            <>Sign in <IconArrow /></>
          )}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "#4A5568", marginTop: "1.25rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#4BB543", textDecoration: "none", fontWeight: 600 }}>Create one</Link>
        </p>
        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "#4A5568", marginTop: "0.5rem" }}>
          <Link to="/products" style={{ color: "#7A8499", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "#4BB543"}
            onMouseLeave={e => e.currentTarget.style.color = "#7A8499"}
          >
            ← Continue browsing without login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
