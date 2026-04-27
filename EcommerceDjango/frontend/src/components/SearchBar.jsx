import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSuggestions } from "../api/products";
import { useStore } from "../store/useStore";

const chips = [
  "cheapest eco laptop",
  "wireless headset",
  "4k monitor",
  "budget phone",
];

export default function SearchBar({ onSubmit }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const setSearchTerm = useStore((s) => s.setSearchTerm);

  useEffect(() => {
    const t = setTimeout(async () => {
      setSearchTerm(input);
      if (!input.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const list = await getSuggestions(input);
        setSuggestions(list);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [input, setSearchTerm]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit?.(input)}
          className="input-dark text-lg shadow-soft"
          placeholder="What are you looking for today?"
        />
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                position: "absolute", zIndex: 10, marginTop: "0.5rem",
                width: "100%", borderRadius: "0.75rem",
                border: "1px solid #222", background: "rgba(17,17,17,0.97)",
                padding: "0.5rem",
                boxShadow: "0 14px 34px rgba(0,0,0,0.6)",
              }}
            >
              {suggestions.map((item) => (
                <button
                  key={item}
                  style={{
                    display: "block", width: "100%", borderRadius: "0.5rem",
                    padding: "0.5rem 0.75rem", textAlign: "left",
                    fontSize: "0.875rem", color: "#ccc", background: "transparent",
                    border: "none", cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1a1a1a"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => {
                    setInput(item);
                    onSubmit?.(item);
                  }}
                >
                  {item}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            style={{
              borderRadius: "999px", border: "1px solid #333",
              background: "rgba(17,17,17,0.6)", padding: "0.35rem 0.75rem",
              fontSize: "0.75rem", color: "#ccc", cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(75,181,67,0.5)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#ccc"; e.currentTarget.style.transform = "translateY(0)"; }}
            onClick={() => {
              setInput(chip);
              onSubmit?.(chip);
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
