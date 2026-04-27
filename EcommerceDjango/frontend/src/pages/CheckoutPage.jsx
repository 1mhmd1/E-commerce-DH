import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { cartCountFromPayload, createStripeCheckout, getCart } from "../api/commerce";
import useScrollReveal from "../hooks/useScrollReveal";

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconStripe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const fields = [
  { key: "fullName", label: "Full Name", placeholder: "John Doe", type: "text" },
  { key: "address", label: "Street Address", placeholder: "123 Main St", type: "text" },
  { key: "city", label: "City", placeholder: "New York", type: "text" },
  { key: "zip", label: "ZIP / Postal Code", placeholder: "10001", type: "text" },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useStore((s) => s.cart);
  const setCart = useStore((s) => s.setCart);
  const setCartCount = useStore((s) => s.setCartCount);

  const total = useMemo(() =>
    cart.reduce((sum, i) => sum + Number(i?.product?.price || 0) * Number(i.quantity || 0), 0),
  [cart]);

  const itemCount = useMemo(() => cart.reduce((s, i) => s + Number(i.quantity || 0), 0), [cart]);

  const [form, setForm] = useState({ fullName: "", address: "", city: "", zip: "" });
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });
  const valid = Object.values(form).every(Boolean) && cart.length > 0;

  useScrollReveal();

  useEffect(() => {
    const load = async () => {
      if (!localStorage.getItem("accessToken")) {
        setStatus({ loading: false, message: "", error: "Please login first." });
        return;
      }
      try {
        const payload = await getCart();
        setCart(payload.items || []);
        setCartCount(cartCountFromPayload(payload));
      } catch {
        setStatus({ loading: false, message: "", error: "Could not load cart for checkout." });
      }
    };
    load();
  }, [setCart, setCartCount]);

  const handlePlaceOrder = async () => {
    if (!valid) return;
    if (!localStorage.getItem("accessToken")) {
      setStatus({ loading: false, message: "", error: "Please sign in to checkout." });
      return;
    }
    try {
      setStatus({ loading: true, message: "", error: "" });
      const { url } = await createStripeCheckout({
        shipping_address: `${form.fullName}, ${form.address}, ${form.city}, ${form.zip}`,
      });
      if (url) { window.location.href = url; return; }
      setStatus({ loading: false, message: "Stripe session failed. Please try again.", error: "" });
    } catch (error) {
      const detail = error?.response?.data?.detail || "Checkout failed. Please try again.";
      setStatus({ loading: false, message: "", error: detail });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Shipping Form */}
      <section className="lg:col-span-3" data-reveal>
        <div className="surface-elevated" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "0.75rem",
              background: "rgba(75,181,67,0.12)", border: "1px solid rgba(75,181,67,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#4BB543",
            }}>
              <IconLock />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#F0EBE1" }}>Secure Checkout</h2>
              <p style={{ fontSize: "0.75rem", color: "#7A8499" }}>Encrypted with SSL • Powered by Stripe</p>
            </div>
          </div>

          {!localStorage.getItem("accessToken") && (
            <div className="alert-info" style={{ marginBottom: "1rem" }}>
              Please sign in to continue checkout.{" "}
              <button style={{ textDecoration: "underline", background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                onClick={() => navigate("/login")}>Go to login</button>
            </div>
          )}

          {/* Step indicator */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {["Shipping", "Payment", "Confirmation"].map((step, i) => (
              <div key={step} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", margin: "0 auto 0.3rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700,
                  background: i === 0 ? "rgba(75,181,67,0.2)" : "#0F1117",
                  border: `1px solid ${i === 0 ? "rgba(75,181,67,0.5)" : "#252D3E"}`,
                  color: i === 0 ? "#4BB543" : "#4A5568",
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: "0.6875rem", color: i === 0 ? "#4BB543" : "#4A5568", fontWeight: 600 }}>{step}</p>
              </div>
            ))}
          </div>

          <p className="section-eyebrow" style={{ marginBottom: "1rem" }}>Shipping Information</p>

          <div style={{ display: "grid", gap: "0.875rem" }}>
            {fields.map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#7A8499", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                  {label}
                </label>
                <input className="input-dark" type={type} value={form[key]} placeholder={placeholder}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>

          {status.error && <div className="alert-error" style={{ marginTop: "1rem" }}>{status.error}</div>}
          {status.message && <div className="alert-info" style={{ marginTop: "1rem" }}>{status.message}</div>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!valid || status.loading}
            onClick={handlePlaceOrder}
            className="btn-primary"
            style={{
              width: "100%", justifyContent: "center", padding: "0.875rem",
              fontSize: "1rem", fontWeight: 700, marginTop: "1.5rem",
              display: "flex", gap: "0.5rem", alignItems: "center",
            }}
          >
            <IconStripe />
            {status.loading ? "Redirecting to Stripe..." : `Pay $${total.toFixed(2)} with Stripe`}
          </motion.button>

          <p style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.7rem", color: "#4A5568" }}>
            🔒 Your payment details are processed securely by Stripe. We never store your card info.
          </p>
        </div>
      </section>

      {/* Order Summary Sidebar */}
      <aside className="lg:col-span-2" data-reveal>
        <div className="surface-elevated" style={{ padding: "1.5rem", position: "sticky", top: "5rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#F0EBE1", marginBottom: "1rem" }}>
            Order Summary
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1rem" }}>
            {cart.map((item) => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                background: "#0F1117", borderRadius: "0.75rem", padding: "0.625rem",
              }}>
                <div style={{ width: 44, height: 44, borderRadius: "0.5rem", overflow: "hidden", flexShrink: 0 }}>
                  <img src={item?.product?.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#F0EBE1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item?.product?.name}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "#7A8499" }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#4BB543", flexShrink: 0 }}>
                  ${(Number(item?.product?.price || 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <hr className="divider" style={{ marginBottom: "0.75rem" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#7A8499" }}>
              <span>Subtotal</span><span style={{ color: "#F0EBE1" }}>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#7A8499" }}>
              <span>Shipping</span><span style={{ color: "#10B981", fontWeight: 600 }}>Free</span>
            </div>
            <hr className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: 800, paddingTop: "0.25rem" }}>
              <span style={{ color: "#F0EBE1" }}>Total</span>
              <span style={{ color: "#F59E0B" }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
