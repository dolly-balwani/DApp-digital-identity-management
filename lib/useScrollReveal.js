"use client";

import { useEffect } from "react";

export default function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("show"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal,.reveal-left,.reveal-scale,.scroll-reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}
