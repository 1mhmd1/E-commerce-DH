/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        card: "#111111",
        primary: "#4BB543",
        accent: "#66BB6A",
        textSecondary: "#9E9E9E",
      },
      boxShadow: {
        soft: "0 14px 34px rgba(0, 0, 0, 0.6)",
        glow: "0 0 0 2px rgba(75,181,67,0.3), 0 14px 34px rgba(75,181,67,0.15)",
      },
      animation: {
        shimmer: "shimmer 1.8s linear infinite",
        fadeUp: "fadeUp 0.5s ease both",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-300px 0" },
          "100%": { backgroundPosition: "300px 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [],
};
