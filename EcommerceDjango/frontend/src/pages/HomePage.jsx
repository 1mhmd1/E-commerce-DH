import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { getFeatured, getRecommended } from "../api/products";
import useScrollReveal from "../hooks/useScrollReveal";

/* ── Floating 3D Product Showcase ────────────────── */
function FloatingCard({ product, delay = 0, rotate = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: rotate }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.06, rotateY: 8, z: 30 }}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <div style={{
        width: "200px", borderRadius: "1.25rem", overflow: "hidden",
        background: "#F8F9FA", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        transform: `perspective(800px) rotateY(${rotate}deg)`,
        transition: "transform 0.5s ease",
        cursor: "pointer",
      }}>
        <div style={{ height: "140px", overflow: "hidden" }}>
          <img src={product.image} alt={product.name} style={{
            width: "100%", height: "100%", objectFit: "cover",
          }} />
        </div>
        <div style={{ padding: "0.75rem" }}>
          <p style={{
            fontSize: "0.8rem", fontWeight: 700, color: "#222",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {product.name}
          </p>
          <p style={{ fontSize: "0.875rem", fontWeight: 800, color: "#388E3C" }}>
            ${product.price}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Animated Counter ────────────────────────────── */
function AnimatedStat({ end, label, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1500;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.round(start));
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <p style={{ fontSize: "2rem", fontWeight: 900, color: "#4BB543", lineHeight: 1 }}>
        {count}{suffix}
      </p>
      <p style={{ fontSize: "0.75rem", color: "#9E9E9E", marginTop: "0.25rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </p>
    </div>
  );
}

/* ── Feature Card ────────────────────────────────── */
const features = [
  {
    icon: "🤖",
    title: "AI-Powered Search",
    desc: "Ask in natural language — find exactly what you need instantly.",
  },
  {
    icon: "🌍",
    title: "Eco-Friendly",
    desc: "Curated products that respect the planet and your wallet.",
  },
  {
    icon: "🔒",
    title: "Secure Checkout",
    desc: "Bank-grade encryption powered by Stripe. Your data stays safe.",
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    desc: "Blazing performance with smooth animations and instant loads.",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const navigate = useNavigate();

  useScrollReveal();

  useEffect(() => {
    (async () => {
      try { setFeatured(await getFeatured()); } catch { setFeatured([]); }
      try { setRecommended(await getRecommended()); } catch { setRecommended([]); }
    })();
  }, []);

  const heroProducts = featured.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

      {/* ═══════════════════════════════════════════════
          HERO SECTION - Full-viewport immersive
          ═══════════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        minHeight: "85vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "3rem 1rem",
        overflow: "hidden",
        borderRadius: "2rem",
        marginBottom: "3rem",
      }}>
        {/* Animated gradient background */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "radial-gradient(ellipse at 30% 20%, rgba(75,181,67,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(75,181,67,0.06) 0%, transparent 50%)",
        }} />

        {/* Animated floating circles */}
        <div className="hero-orb orb-1" />
        <div className="hero-orb orb-2" />
        <div className="hero-orb orb-3" />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: "700px" }}>
          {/* Eco badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "rgba(75,181,67,0.1)", border: "1px solid rgba(75,181,67,0.25)",
              borderRadius: "999px", padding: "0.35rem 1rem", marginBottom: "1.5rem",
            }}
          >
            <span style={{ fontSize: "1rem" }}>🌿</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#4BB543", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Eco-Friendly Shopping
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900,
              letterSpacing: "-0.04em", color: "#fff",
              lineHeight: 1.1, marginBottom: "1rem",
            }}
          >
            Shop Smarter with{" "}
            <span style={{
              color: "#4BB543",
              textShadow: "0 0 40px rgba(75,181,67,0.35)",
            }}>
              AI-Powered
            </span>{" "}
            Discovery
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              color: "#9E9E9E", maxWidth: 540, margin: "0 auto 2rem",
              fontSize: "1.0625rem", lineHeight: 1.7,
            }}
          >
            Just describe what you want — "cheapest eco laptop", "best rated under $500" —
            and our AI finds exactly what you need.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <SearchBar onSubmit={(q) => navigate(`/products?search=${encodeURIComponent(q)}`)} />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.75rem" }}
          >
            <Link to="/products" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.875rem 2rem", borderRadius: "999px",
              background: "#4BB543", color: "#fff", fontWeight: 700,
              fontSize: "1rem", textDecoration: "none",
              boxShadow: "0 8px 30px rgba(75,181,67,0.35)",
              transition: "all 0.3s ease",
            }}>
              🛒 Start Shopping
            </Link>
            <Link to="/products" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.875rem 2rem", borderRadius: "999px",
              background: "transparent", color: "#9E9E9E",
              border: "1px solid #333", fontWeight: 600,
              fontSize: "1rem", textDecoration: "none",
              transition: "all 0.3s ease",
            }}>
              Explore Catalog →
            </Link>
          </motion.div>
        </div>

        {/* 3D Floating Product Cards */}
        {heroProducts.length >= 3 && (
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", gap: "1.5rem",
            marginTop: "3rem",
            perspective: "1200px",
          }} className="hero-products">
            <FloatingCard product={heroProducts[0]} delay={0.7} rotate={-12} />
            <FloatingCard product={heroProducts[1]} delay={0.85} rotate={0} />
            <FloatingCard product={heroProducts[2]} delay={1.0} rotate={12} />
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════
          STATS STRIP
          ═══════════════════════════════════════════════ */}
      <section style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1rem", marginBottom: "3rem",
      }} className="stats-grid" data-reveal>
        <AnimatedStat end={500} suffix="+" label="Products" />
        <AnimatedStat end={50} suffix="k" label="Happy Customers" />
        <AnimatedStat end={99} suffix="%" label="Satisfaction" />
        <AnimatedStat end={24} suffix="/7" label="Support" />
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════════ */}
      <section style={{ marginBottom: "3.5rem" }} data-reveal>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p className="section-eyebrow">Why EcoShop?</p>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            Built for the Modern Shopper
          </h2>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}>
          {features.map(({ icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, borderColor: "rgba(75,181,67,0.35)" }}
              style={{
                background: "#111", border: "1px solid #222",
                borderRadius: "1.25rem", padding: "1.5rem",
                transition: "all 0.3s ease", cursor: "default",
              }}
            >
              <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.75rem" }}>{icon}</span>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: "0.4rem" }}>{title}</h3>
              <p style={{ fontSize: "0.8125rem", color: "#9E9E9E", lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURED PRODUCTS
          ═══════════════════════════════════════════════ */}
      {featured.length > 0 && (
        <section data-reveal style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>⭐</span>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products" style={{
              fontSize: "0.8125rem", color: "#4BB543", textDecoration: "none",
              fontWeight: 600, transition: "opacity 0.2s",
            }}>
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          RECOMMENDED - Auto-Scrolling Marquee
          ═══════════════════════════════════════════════ */}
      {recommended.length > 0 && (
        <section data-reveal style={{ marginBottom: "3rem", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🔥</span>
              <h2 className="section-title">Recommended</h2>
            </div>
            <Link to="/products" style={{
              fontSize: "0.8125rem", color: "#4BB543", textDecoration: "none",
              fontWeight: 600,
            }}>
              View All →
            </Link>
          </div>

          {/* Gradient fade edges */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: "60px", zIndex: 2,
              background: "linear-gradient(90deg, #000 0%, transparent 100%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: "60px", zIndex: 2,
              background: "linear-gradient(270deg, #000 0%, transparent 100%)",
              pointerEvents: "none",
            }} />

            {/* Marquee track */}
            <div className="marquee-track">
              <div className="marquee-inner">
                {/* Original set */}
                {recommended.map((p) => (
                  <div key={`a-${p.id}`} style={{ minWidth: 280, flexShrink: 0 }}>
                    <ProductCard product={p} />
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {recommended.map((p) => (
                  <div key={`b-${p.id}`} style={{ minWidth: 280, flexShrink: 0 }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          CALL TO ACTION BANNER
          ═══════════════════════════════════════════════ */}
      <section data-reveal style={{
        background: "linear-gradient(135deg, rgba(75,181,67,0.12) 0%, rgba(75,181,67,0.03) 100%)",
        border: "1px solid rgba(75,181,67,0.2)",
        borderRadius: "2rem", padding: "3rem 2rem",
        textAlign: "center", marginBottom: "2rem",
      }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: "0.75rem" }}>
          Ready to Shop Sustainably?
        </h2>
        <p style={{ color: "#9E9E9E", maxWidth: 500, margin: "0 auto 1.5rem", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          Join thousands of eco-conscious shoppers. Find premium products at great prices with AI-powered recommendations.
        </p>
        <Link to="/products" className="btn-primary" style={{
          fontSize: "1.0625rem", padding: "0.875rem 2.5rem",
          boxShadow: "0 8px 30px rgba(75,181,67,0.3)",
        }}>
          🌱 Browse Products
        </Link>
      </section>

      {/* ═══════════════════════════════════════════════
          CSS Animations
          ═══════════════════════════════════════════════ */}
      <style>{`
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: float 8s ease-in-out infinite;
        }
        .orb-1 {
          width: 300px; height: 300px;
          background: rgba(75, 181, 67, 0.15);
          top: 10%; left: 15%;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 200px; height: 200px;
          background: rgba(75, 181, 67, 0.1);
          bottom: 20%; right: 10%;
          animation-delay: -3s;
        }
        .orb-3 {
          width: 150px; height: 150px;
          background: rgba(75, 181, 67, 0.08);
          top: 50%; left: 60%;
          animation-delay: -5s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        /* ── Infinite Marquee ──────────────────────── */
        .marquee-track {
          overflow: hidden;
          width: 100%;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 60px, #000 calc(100% - 60px), transparent);
          mask-image: linear-gradient(90deg, transparent, #000 60px, #000 calc(100% - 60px), transparent);
        }
        .marquee-inner {
          display: flex;
          gap: 1.125rem;
          width: max-content;
          animation: marquee-scroll 35s linear infinite;
        }
        .marquee-track:hover .marquee-inner {
          animation-play-state: paused;
        }
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 768px) {
          .hero-products { display: none !important; }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .marquee-inner {
            animation-duration: 20s;
          }
        }
      `}</style>
    </div>
  );
}
