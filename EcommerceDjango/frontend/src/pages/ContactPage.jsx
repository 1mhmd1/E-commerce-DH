import { useState } from "react";
import { motion } from "framer-motion";
import api from "../api/client";
import useScrollReveal from "../hooks/useScrollReveal";

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ loading: false, sent: false, error: "" });

  useScrollReveal();

  const valid = form.name && form.email && form.subject && form.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    try {
      setStatus({ loading: true, sent: false, error: "" });
      await api.post("/contact/", form);
      setStatus({ loading: false, sent: true, error: "" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus({ loading: false, sent: false, error: "Failed to send message. Please try again." });
    }
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div className="surface-elevated" style={{ padding: "2.5rem" }} data-reveal>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "1rem", margin: "0 auto 0.75rem",
            background: "rgba(75,181,67,0.12)", border: "1px solid rgba(75,181,67,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#4BB543",
          }}>
            <IconMail />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F0EBE1", marginBottom: "0.3rem" }}>Contact Us</h1>
          <p style={{ fontSize: "0.875rem", color: "#7A8499" }}>Have a question or feedback? We'd love to hear from you.</p>
        </div>

        {status.sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: "center", padding: "2rem",
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "1rem",
            }}
          >
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✉️</p>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#10B981", marginBottom: "0.3rem" }}>Message Sent!</h3>
            <p style={{ color: "#7A8499", fontSize: "0.875rem" }}>Thank you for reaching out. We'll get back to you soon.</p>
            <button className="btn-primary" style={{ marginTop: "1rem" }}
              onClick={() => setStatus({ loading: false, sent: false, error: "" })}>
              Send Another Message
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.875rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#7A8499", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                  Name
                </label>
                <input className="input-dark" value={form.name} placeholder="Your name"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#7A8499", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                  Email
                </label>
                <input className="input-dark" type="email" value={form.email} placeholder="you@example.com"
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#7A8499", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                Subject
              </label>
              <input className="input-dark" value={form.subject} placeholder="How can we help?"
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#7A8499", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                Message
              </label>
              <textarea className="input-dark" rows="5" value={form.message} placeholder="Tell us more..."
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} required
                style={{ resize: "vertical", minHeight: "120px" }} />
            </div>
            {status.error && <div className="alert-error">{status.error}</div>}
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              type="submit"
              disabled={!valid || status.loading}
              style={{ width: "100%", justifyContent: "center", padding: "0.875rem", fontSize: "0.9375rem", fontWeight: 700, display: "flex" }}
            >
              {status.loading ? "Sending..." : "Send Message"}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
}
