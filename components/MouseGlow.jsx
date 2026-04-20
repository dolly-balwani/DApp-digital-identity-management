"use client";

import { useEffect, useRef } from "react";

export default function MouseGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let mx = 0, my = 0, gx = 0, gy = 0;

    const move = (e) => { mx = e.clientX; my = e.clientY; };

    const tick = () => {
      gx += (mx - gx) * 0.06;
      gy += (my - gy) * 0.06;
      el.style.left = gx + "px";
      el.style.top = gy + "px";
      requestAnimationFrame(tick);
    };

    addEventListener("mousemove", move);
    requestAnimationFrame(tick);

    return () => removeEventListener("mousemove", move);
  }, []);

  return <div ref={ref} className="cursor-glow" />;
}
