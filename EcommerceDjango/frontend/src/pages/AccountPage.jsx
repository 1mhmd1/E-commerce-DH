import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getOrders,
  getProfile,
  updateProfile,
  getAddresses,
  createAddress,
  deleteAddress,
} from "../api/commerce";
import { useToastStore } from "../store/useToastStore";

/* ── Icons ───────────────────────────────────────── */
const IconUser = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconBag  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IconMap  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconSave = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

const tabs = [
  { key: "orders",    label: "Orders",     icon: <IconBag /> },
  { key: "profile",   label: "Profile",    icon: <IconUser /> },
  { key: "addresses", label: "Addresses",  icon: <IconMap /> },
];

/* ── Status Pill ─────────────────────────────────── */
function StatusPill({ status }) {
  const map = {
    pending:   { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.28)" },
    paid:      { color: "#4BB543", bg: "rgba(75,181,67,0.12)", border: "rgba(75,181,67,0.28)" },
    shipped:   { color: "#6366F1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.28)" },
    delivered: { color: "#10B981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.28)" },
  };
  const s = map[status?.toLowerCase()] || map.pending;
  return (
    <span style={{
      padding: "0.2rem 0.65rem", borderRadius: "99px", fontSize: "0.6875rem",
      fontWeight: 600, textTransform: "capitalize", color: s.color, background: s.bg,
      border: `1px solid ${s.border}`,
    }}>
      {status}
    </span>
  );
}

/* ── Address Form ────────────────────────────────── */
const emptyAddr = { label: "Home", full_name: "", street: "", city: "", state: "", zip_code: "", country: "US" };

function AddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ ...emptyAddr });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.full_name && form.street && form.city && form.zip_code;

  return (
    <div style={{
      background: "#1a1a1a", border: "1px solid #222",
      borderRadius: "1rem", padding: "1.25rem",
    }}>
      <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", marginBottom: "0.875rem" }}>
        New Address
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
        {[
          { k: "label", ph: "Label (Home, Work...)", span: 1 },
          { k: "full_name", ph: "Full Name", span: 1 },
          { k: "street", ph: "Street Address", span: 2 },
          { k: "city", ph: "City", span: 1 },
          { k: "state", ph: "State / Province", span: 1 },
          { k: "zip_code", ph: "ZIP Code", span: 1 },
          { k: "country", ph: "Country", span: 1 },
        ].map(({ k, ph, span }) => (
          <input key={k} className="input-dark" placeholder={ph} value={form[k]}
            onChange={e => set(k, e.target.value)}
            style={{ gridColumn: span === 2 ? "1 / -1" : undefined }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.875rem" }}>
        <button className="btn-primary" style={{ fontSize: "0.8125rem", padding: "0.5rem 1.25rem" }}
          disabled={!valid}
          onClick={() => onSave(form)}
        >
          <IconSave /> Save
        </button>
        <button className="btn-secondary" style={{ fontSize: "0.8125rem" }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────── */
export default function AccountPage() {
  const [active, setActive]       = useState("orders");
  const [orders, setOrders]       = useState([]);
  const [profile, setProfile]     = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [error, setError]         = useState("");
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [saving, setSaving]       = useState(false);
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const authUser = localStorage.getItem("authUser") || "";

  /* ── Load data ─────────────────────────────────── */
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) return;

    const load = async () => {
      try {
        const [ordersRes, profileRes, addrsRes] = await Promise.allSettled([
          getOrders(),
          getProfile(),
          getAddresses(),
        ]);
        if (ordersRes.status === "fulfilled") setOrders(ordersRes.value.results || ordersRes.value || []);
        if (profileRes.status === "fulfilled") setProfile(profileRes.value);
        if (addrsRes.status === "fulfilled") setAddresses(addrsRes.value);
      } catch {
        setError("Could not load account data.");
      }
    };
    load();
  }, []);

  /* ── Profile form state ────────────────────────── */
  const [profileForm, setProfileForm] = useState({});
  useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(profileForm);
      setProfile(updated);
      addToast("Profile updated!");
    } catch {
      addToast("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (form) => {
    try {
      const newAddr = await createAddress(form);
      setAddresses(prev => [...prev, newAddr]);
      setShowAddrForm(false);
      addToast("Address added!");
    } catch {
      addToast("Failed to add address.", "error");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      addToast("Address removed.");
    } catch {
      addToast("Failed to delete address.", "error");
    }
  };

  /* ── Unauthenticated state ─────────────────────── */
  if (!authUser) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <p style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔒</p>
        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
          Please log in to view your account
        </p>
        <p style={{ color: "#9E9E9E", marginBottom: "1.5rem" }}>You need to be signed in to access orders and profile.</p>
        <button className="btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        background: "#111", border: "1px solid #222", borderRadius: "1.25rem",
        padding: "1.5rem", marginBottom: "1.25rem",
        display: "flex", alignItems: "center", gap: "1rem",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "rgba(75,181,67,0.15)", border: "2px solid rgba(75,181,67,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#4BB543", fontWeight: 700, fontSize: "1.1rem", flexShrink: 0,
        }}>
          {authUser.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#4BB543", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            My Account
          </p>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            {profile?.first_name && profile?.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : authUser}
          </h1>
          {profile?.email && (
            <p style={{ fontSize: "0.8125rem", color: "#9E9E9E", marginTop: "2px" }}>{profile.email}</p>
          )}
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <p style={{ fontSize: "0.7rem", color: "#666", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.08em" }}>
            Total Orders
          </p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#4BB543" }}>{orders.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.625rem 1.25rem", borderRadius: "999px", fontSize: "0.8125rem",
              fontWeight: 600, cursor: "pointer", transition: "all 0.2s", border: "1px solid",
              background: active === key ? "rgba(75,181,67,0.12)" : "#111",
              borderColor: active === key ? "rgba(75,181,67,0.35)" : "#222",
              color: active === key ? "#4BB543" : "#9E9E9E",
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          style={{ background: "#111", border: "1px solid #222", borderRadius: "1.25rem", padding: "1.5rem" }}
        >
          {/* ── Orders Tab ─────────────────────────────── */}
          {active === "orders" && (
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>Order History</h2>
              {error && <div className="alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
              {orders.length === 0 && !error && (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📦</p>
                  <p style={{ fontWeight: 600, color: "#fff", marginBottom: "0.4rem" }}>No orders yet</p>
                  <p style={{ fontSize: "0.875rem", color: "#9E9E9E" }}>Your order history will appear here after your first purchase.</p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.875rem" }}>
                {orders.map((order) => (
                  <div key={order.id} style={{
                    background: "#1a1a1a", border: "1px solid #222", borderRadius: "1rem",
                    padding: "1.125rem", transition: "border-color 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
                      <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>Order #{order.id}</span>
                      <StatusPill status={order.status} />
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div style={{ marginBottom: "0.5rem" }}>
                        {order.items.slice(0, 3).map((item) => (
                          <p key={item.id} style={{ fontSize: "0.75rem", color: "#9E9E9E", marginBottom: "2px" }}>
                            {item.product_name_snapshot} × {item.quantity}
                          </p>
                        ))}
                        {order.items.length > 3 && (
                          <p style={{ fontSize: "0.7rem", color: "#666" }}>+{order.items.length - 3} more items</p>
                        )}
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "#9E9E9E" }}>
                      <span>Total</span>
                      <span style={{ fontWeight: 700, color: "#4BB543" }}>${order.total}</span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#555", marginTop: "0.3rem" }}>
                      {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Profile Tab ────────────────────────────── */}
          {active === "profile" && (
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>Edit Profile</h2>
              <div style={{
                background: "#1a1a1a", border: "1px solid #222", borderRadius: "1rem",
                padding: "1.25rem", display: "grid", gap: "0.875rem",
              }}>
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#9E9E9E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                    Username
                  </p>
                  <p style={{ fontWeight: 600, color: "#fff", fontSize: "0.9375rem" }}>{authUser}</p>
                  <p style={{ fontSize: "0.65rem", color: "#555", marginTop: "2px" }}>Username cannot be changed</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input className="input-dark" value={profileForm.first_name || ""}
                      onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input className="input-dark" value={profileForm.last_name || ""}
                      onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input className="input-dark" type="email" value={profileForm.email || ""}
                    onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                {profile?.date_joined && (
                  <p style={{ fontSize: "0.75rem", color: "#555" }}>
                    Member since {new Date(profile.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                  </p>
                )}
                <button className="btn-primary" style={{ justifySelf: "start" }}
                  onClick={handleProfileSave} disabled={saving}
                >
                  <IconSave /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── Addresses Tab ──────────────────────────── */}
          {active === "addresses" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", margin: 0 }}>Shipping Addresses</h2>
                {!showAddrForm && (
                  <button className="btn-primary" style={{ fontSize: "0.8125rem", padding: "0.45rem 1rem" }}
                    onClick={() => setShowAddrForm(true)}
                  >
                    <IconPlus /> Add Address
                  </button>
                )}
              </div>

              {showAddrForm && (
                <div style={{ marginBottom: "1rem" }}>
                  <AddressForm onSave={handleAddAddress} onCancel={() => setShowAddrForm(false)} />
                </div>
              )}

              {addresses.length === 0 && !showAddrForm && (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📍</p>
                  <p style={{ fontWeight: 600, color: "#fff", marginBottom: "0.4rem" }}>No saved addresses</p>
                  <p style={{ fontSize: "0.875rem", color: "#9E9E9E" }}>Add a shipping address for faster checkout.</p>
                </div>
              )}

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {addresses.map((addr) => (
                  <div key={addr.id} style={{
                    background: "#1a1a1a", border: "1px solid #222", borderRadius: "1rem",
                    padding: "1rem", display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "0.5rem", flexShrink: 0,
                      background: "rgba(75,181,67,0.1)", border: "1px solid rgba(75,181,67,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#4BB543",
                    }}>
                      <IconMap />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2px" }}>
                        <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.875rem" }}>{addr.label}</span>
                        {addr.is_default && (
                          <span style={{
                            fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px",
                            borderRadius: "999px", background: "rgba(75,181,67,0.12)",
                            color: "#4BB543", border: "1px solid rgba(75,181,67,0.3)",
                          }}>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.8125rem", color: "#9E9E9E" }}>{addr.full_name}</p>
                      <p style={{ fontSize: "0.8125rem", color: "#9E9E9E" }}>
                        {addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zip_code}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      style={{
                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                        borderRadius: "0.5rem", padding: "0.4rem",
                        color: "#EF4444", cursor: "pointer", flexShrink: 0,
                        transition: "all 0.2s",
                      }}
                      title="Delete address"
                    >
                      <IconTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: "0.75rem", fontWeight: 600,
  color: "#9E9E9E", textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: "0.35rem",
};
