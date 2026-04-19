"use client";

import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let raf;
    let dots = [];
    let mouse = { x: -999, y: -999 };
    const N = 70;
    const LINK = 120;
    const MOUSE_R = 180;

    const resize = () => { c.width = innerWidth; c.height = innerHeight; };

    class Dot {
      constructor() {
        this.x = Math.random() * c.width;
        this.y = Math.random() * c.height;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.r = Math.random() * 1.2 + 0.4;
        this.o = Math.random() * 0.35 + 0.05;
        this.hue = Math.random() > 0.6 ? 190 : 260;
      }
      update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_R) {
          const f = (MOUSE_R - d) / MOUSE_R;
          this.vx += (dx / d) * f * 0.25;
          this.vy += (dy / d) * f * 0.25;
        }
        this.vx *= 0.996;
        this.vy *= 0.996;
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -10) this.x = c.width + 10;
        if (this.x > c.width + 10) this.x = -10;
        if (this.y < -10) this.y = c.height + 10;
        if (this.y > c.height + 10) this.y = -10;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 6.28);
        ctx.fillStyle = `hsla(${this.hue},70%,65%,${this.o})`;
        ctx.fill();
      }
    }

    const init = () => { dots = Array.from({ length: N }, () => new Dot()); };

    const frame = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (let i = 0; i < dots.length; i++) {
        dots[i].update();
        dots[i].draw();
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            const a = (1 - d / LINK) * 0.06;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(6,182,212,${a})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -999; mouse.y = -999; };

    resize(); init(); frame();
    addEventListener("resize", () => { resize(); init(); });
    addEventListener("mousemove", onMouse);
    addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("mousemove", onMouse);
      removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} id="particles" />;
}
