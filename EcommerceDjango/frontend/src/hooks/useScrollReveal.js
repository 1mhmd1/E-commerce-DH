import { useEffect, useRef } from "react";

/**
 * Custom hook that adds a `.revealed` class to elements with
 * `data-reveal` attribute when they scroll into view.
 *
 * Usage:
 *   useScrollReveal();
 *   <div data-reveal>content</div>
 *
 * Pair with CSS:
 *   [data-reveal] { opacity:0; transform: translateY(24px); transition: ... }
 *   [data-reveal].revealed { opacity:1; transform: translateY(0); }
 */
export default function useScrollReveal(rootMargin = "0px 0px -60px 0px") {
  const observed = useRef(false);

  useEffect(() => {
    if (observed.current) return;
    observed.current = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold: 0.12 }
    );

    // Observe existing elements
    const reveal = () => {
      document.querySelectorAll("[data-reveal]:not(.revealed)").forEach((el) => {
        observer.observe(el);
      });
    };

    reveal();

    // Re-observe when new elements are added (route changes)
    const mo = new MutationObserver(reveal);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
      observed.current = false;
    };
  }, [rootMargin]);
}
