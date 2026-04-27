import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { getCategories, getProducts } from "../api/products";
import useScrollReveal from "../hooks/useScrollReveal";

const sortOptions = [
  { value: "", label: "Default" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest First" },
];

const FilterSection = ({ title, children }) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={{
      display: "block", fontSize: "0.7rem", fontWeight: 700,
      color: "#4BB543", letterSpacing: "0.1em", textTransform: "uppercase",
      marginBottom: "0.45rem",
    }}>
      {title}
    </label>
    {children}
  </div>
);

export default function ProductsPage() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    in_stock: false,
    on_offer: false,
    price_max: 2500,
    search: params.get("search") || "",
    ordering: "",
  });
  const categoryOptions = Array.isArray(categories) ? categories : [];

  useScrollReveal();

  useEffect(() => {
    (async () => {
      try { setCategories(await getCategories()); } catch { setCategories([]); }
    })();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProducts({
          category: filters.category || undefined,
          in_stock: filters.in_stock ? "true" : undefined,
          on_offer: filters.on_offer ? "true" : undefined,
          price_max: filters.price_max,
          search: filters.search || undefined,
          ordering: filters.ordering || undefined,
        });
        setProducts(data.results || []);
      } catch {
        setProducts([]);
        setError("Could not load products. Check backend server and CORS settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const countText = useMemo(() => `${products.length} products found`, [products.length]);
  const offerCount = useMemo(() => products.filter(p => p.discount_percent > 0).length, [products]);

  return (
    <div>
      {/* Hero Banner */}
      <div data-reveal style={{
        background: "linear-gradient(135deg, rgba(75,181,67,0.12) 0%, rgba(0,0,0,0) 100%)",
        border: "1px solid rgba(75,181,67,0.15)",
        borderRadius: "1.5rem",
        padding: "2rem 2.5rem",
        marginBottom: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40%", right: "-5%",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(75,181,67,0.08) 0%, transparent 70%)",
        }} />
        <p className="section-eyebrow">Browse our collection</p>
        <h1 style={{
          fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em",
          color: "#F0EBE1", marginTop: "0.25rem", marginBottom: "0.5rem",
        }}>
          Product Catalog
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#7A8499", maxWidth: "600px" }}>
          Discover premium eco-friendly electronics. Filter by category, price, and availability to find your perfect match.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <span style={{
            background: "rgba(75,181,67,0.15)", color: "#4BB543",
            padding: "0.3rem 0.8rem", borderRadius: "999px",
            fontSize: "0.75rem", fontWeight: 700,
          }}>
            {countText}
          </span>
          {offerCount > 0 && (
            <span style={{
              background: "rgba(229,62,62,0.1)", color: "#E53E3E",
              padding: "0.3rem 0.8rem", borderRadius: "999px",
              fontSize: "0.75rem", fontWeight: 700,
            }}>
              🏷️ {offerCount} on offer
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Filters Sidebar */}
        <aside className="surface-elevated h-fit p-5 lg:col-span-3 lg:sticky lg:top-20" data-reveal>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#F0EBE1", marginBottom: "0.25rem" }}>Filters</h3>
          <p className="section-eyebrow" style={{ marginBottom: "1.25rem" }}>Refine your search</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <FilterSection title="Search">
              <input className="input-dark" placeholder="Search products..." value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
            </FilterSection>

            <FilterSection title="Category">
              <select className="input-dark" value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
                <option value="">All categories</option>
                {categoryOptions.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </FilterSection>

            <FilterSection title="Sort by">
              <select className="input-dark" value={filters.ordering}
                onChange={(e) => setFilters((f) => ({ ...f, ordering: e.target.value }))}>
                {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </FilterSection>

            <FilterSection title="Max Price">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.8125rem", color: "#7A8499" }}>$50</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#4BB543" }}>${filters.price_max}</span>
                <span style={{ fontSize: "0.8125rem", color: "#7A8499" }}>$2500</span>
              </div>
              <input type="range" min="50" max="2500" value={filters.price_max}
                onChange={(e) => setFilters((f) => ({ ...f, price_max: e.target.value }))}
                style={{ width: "100%", accentColor: "#4BB543" }} />
            </FilterSection>

            {/* Toggles */}
            <div style={{
              display: "flex", flexDirection: "column", gap: "0.6rem",
              paddingTop: "0.5rem", borderTop: "1px solid #222",
            }}>
              <label style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                fontSize: "0.875rem", color: "#7A8499", cursor: "pointer",
              }}>
                <input type="checkbox" checked={filters.in_stock} style={{ accentColor: "#4BB543" }}
                  onChange={(e) => setFilters((f) => ({ ...f, in_stock: e.target.checked }))} />
                In stock only
              </label>
              <label style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                fontSize: "0.875rem", cursor: "pointer",
                color: filters.on_offer ? "#E53E3E" : "#7A8499",
                fontWeight: filters.on_offer ? 600 : 400,
                transition: "all 0.25s",
              }}>
                <input type="checkbox" checked={filters.on_offer}
                  style={{ accentColor: "#E53E3E" }}
                  onChange={(e) => setFilters((f) => ({ ...f, on_offer: e.target.checked }))} />
                🏷️ On Offer
              </label>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <section className="space-y-4 lg:col-span-9">
          {error && <div className="alert-error">{error}</div>}
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : products.length > 0
                  ? products.map((product, i) => (
                    <motion.div layout key={product.id} data-reveal data-reveal-delay={Math.min(i + 1, 4)}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))
                  : (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        padding: "4rem 2rem",
                      }}
                    >
                      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🍃</div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#F0EBE1", marginBottom: "0.5rem" }}>
                        No products found
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "#7A8499" }}>
                        Try adjusting your filters or search terms to discover more eco-friendly products.
                      </p>
                    </motion.div>
                  )
              }
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
