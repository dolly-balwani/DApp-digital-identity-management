"use client";

import { useEffect } from "react";

/**
 * Hook that applies scroll-reveal animations to elements
 * with class "scroll-reveal", "scroll-reveal-left", "scroll-reveal-right", "scroll-reveal-scale"
 */
export default function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const elements = document.querySelectorAll(
      ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale"
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });
}
