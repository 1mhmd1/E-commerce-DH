import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { logout } from "../api/auth";

/* ── SVG Icons ───────────────────────────────────── */
const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconX = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconLeaf = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4BB543" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25"/><path d="M3 21c0-8 4-12 10-14"/>
  </svg>
);
const IconStore = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconScale = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/>
    <line x1="7" y1="21" x2="17" y2="21"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M12 3h5"/>
    <path d="M12 3H7"/>
  </svg>
);
const IconCart = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconLogin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

/* ── Badge Component ─────────────────────────────── */
function Badge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span style={{
      position: "absolute", top: "-4px", right: "-6px",
      background: "#4BB543", color: "#fff",
      borderRadius: "999px", padding: "1px 5px",
      fontSize: "0.6rem", fontWeight: 800,
      lineHeight: "1.3", minWidth: "16px", textAlign: "center",
      boxShadow: "0 2px 6px rgba(75,181,67,0.4)",
    }}>
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function Navbar() {
  const compareCount = useStore((s) => s.compare.length);
  const cartCount = useStore((s) => s.cartCount);
  const authUser = useStore((s) => s.authUser);
  const setAuthUser = useStore((s) => s.setAuthUser);
  const setCart = useStore((s) => s.setCart);
  const setCartCount = useStore((s) => s.setCartCount);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const linkStyle = (isActive) => ({
    display: "flex", alignItems: "center", gap: "0.4rem",
    padding: "0.45rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.8125rem",
    fontWeight: 600,
    transition: "all 0.2s",
    textDecoration: "none",
    background: isActive ? "rgba(75,181,67,0.12)" : "transparent",
    color: isActive ? "#4BB543" : "#9E9E9E",
    whiteSpace: "nowrap",
  });

  const iconBtnStyle = (isActive) => ({
    position: "relative",
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "36px", height: "36px",
    borderRadius: "50%",
    transition: "all 0.2s",
    textDecoration: "none",
    background: isActive ? "rgba(75,181,67,0.12)" : "transparent",
    color: isActive ? "#4BB543" : "#9E9E9E",
    border: isActive ? "1px solid rgba(75,181,67,0.3)" : "1px solid transparent",
  });

  const handleLogout = () => {
    logout();
    setAuthUser("");
    setCart([]);
    setCartCount(0);
    setOpen(false);
    navigate("/login");
  };

  const close = () => setOpen(false);

  /* ── Desktop Left Links ──────────────────────────── */
  const leftLinks = (
    <>
      <NavLink to="/products" style={({ isActive }) => linkStyle(isActive)} onClick={close}>
        <IconStore /> Products
      </NavLink>
      <NavLink to="/contact" style={({ isActive }) => linkStyle(isActive)} onClick={close}>
        <IconMail /> Contact
      </NavLink>
    </>
  );

  /* ── Desktop Right Icons ─────────────────────────── */
  const rightIcons = (
    <>
      <NavLink to="/compare" style={({ isActive }) => iconBtnStyle(isActive)} onClick={close} title="Compare">
        <IconScale />
        <Badge count={compareCount} />
      </NavLink>
      <NavLink to="/cart" style={({ isActive }) => iconBtnStyle(isActive)} onClick={close} title="Cart">
        <IconCart />
        <Badge count={cartCount} />
      </NavLink>
      {authUser ? (
        <>
          <NavLink to="/account" style={({ isActive }) => iconBtnStyle(isActive)} onClick={close} title="My Account">
            <IconUser />
          </NavLink>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              ...iconBtnStyle(false), border: "none", cursor: "pointer",
              background: "transparent", padding: 0,
            }}
          >
            <IconLogout />
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" style={({ isActive }) => linkStyle(isActive)} onClick={close}>
            <IconLogin /> Login
          </NavLink>
          <NavLink to="/register" onClick={close}
            style={({ isActive }) => ({
              ...linkStyle(isActive),
              background: "#4BB543", color: "#fff", fontWeight: 700,
              boxShadow: "0 2px 10px rgba(75,181,67,0.25)",
            })}
          >
            Register
          </NavLink>
        </>
      )}
    </>
  );

  /* ── Mobile Links (full text) ────────────────────── */
  const mobileLinks = (
    <>
      <NavLink to="/products" style={({ isActive }) => linkStyle(isActive)} onClick={close}>
        <IconStore /> Products
      </NavLink>
      <NavLink to="/compare" style={({ isActive }) => linkStyle(isActive)} onClick={close}>
        <IconScale /> Compare {compareCount > 0 && <Badge count={compareCount} />}
      </NavLink>
      <NavLink to="/cart" style={({ isActive }) => linkStyle(isActive)} onClick={close}>
        <IconCart /> Cart {cartCount > 0 && <Badge count={cartCount} />}
      </NavLink>
      <NavLink to="/contact" style={({ isActive }) => linkStyle(isActive)} onClick={close}>
        <IconMail /> Contact
      </NavLink>
      {authUser && (
        <NavLink to="/account" style={({ isActive }) => linkStyle(isActive)} onClick={close}>
          <IconUser /> My Account
        </NavLink>
      )}
      <div style={{ borderTop: "1px solid #222", margin: "0.5rem 0" }} />
      {authUser ? (
        <>
          <span style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem", color: "#9E9E9E", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <IconUser /> {authUser}
          </span>
          <button style={{ ...linkStyle(false), border: "none", cursor: "pointer", color: "#EF4444" }} onClick={handleLogout}>
            <IconLogout /> Logout
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" style={({ isActive }) => linkStyle(isActive)} onClick={close}>
            <IconLogin /> Login
          </NavLink>
          <NavLink to="/register" onClick={close}
            style={({ isActive }) => ({
              ...linkStyle(isActive), background: "#4BB543", color: "#fff", fontWeight: 700,
            })}
          >
            Register
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30,
      borderBottom: "1px solid #222", background: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(14px)",
    }}>
      <div className="container-shell" style={{
        display: "flex", height: 60, alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          textDecoration: "none", flexShrink: 0,
        }}>
          <IconLeaf />
          <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "#4BB543", letterSpacing: "-0.02em" }}>
            EcoShop
          </span>
        </Link>

        {/* Desktop Nav Center */}
        <nav className="nav-links" style={{
          borderRadius: "999px", border: "1px solid #1a1a1a",
          background: "rgba(17,17,17,0.85)", padding: "0.2rem 0.4rem",
          display: "flex", alignItems: "center", gap: "0.15rem",
        }}>
          {leftLinks}
        </nav>

        {/* Desktop Right Icons */}
        <div className="nav-links" style={{
          display: "flex", alignItems: "center", gap: "0.35rem",
        }}>
          {rightIcons}
        </div>

        {/* Hamburger (mobile) */}
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="nav-backdrop" onClick={close} />
          <nav className="nav-links open">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontWeight: 800, color: "#4BB543", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <IconLeaf /> EcoShop
              </span>
              <button className="hamburger" style={{ display: "flex" }} onClick={close}><IconX /></button>
            </div>
            {mobileLinks}
          </nav>
        </>
      )}
    </header>
  );
}
