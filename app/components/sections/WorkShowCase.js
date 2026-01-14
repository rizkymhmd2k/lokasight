"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

const ITEMS = [
  { title: "Project One", desc: "Description for project one" },
  { title: "Project Two", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

export default function WorkShowcase() {
  const section = useRef(null);
  const cards = useRef([]);
  const start = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    lenis.on("scroll", ({ scroll }) => {
      if (!section.current) return;
      const rect = section.current.getBoundingClientRect();
      if (rect.top > 0) { start.current = 0; setActive(0); return; }

      if (start.current === 0) start.current = scroll;
      const delta = scroll - start.current;
      const vh = window.innerHeight;

      let closest = 0, minDist = Infinity;

      cards.current.forEach((card, i) => {
        if (!card) return;

        const progress = (delta - i * vh) / vh; // 0 to 1 scalar
        const y = (1 - progress) * vh;

        let scale = 1, rotate = 0;
        if (progress < 0.5) { // Below center
          const norm = 1 - (progress * 2); // 1 → 0
          scale = 1 + 0.2 * norm;
          rotate = 15 * norm;
        }

        card.style.transform = `translateY(${y}px) scale(${scale}) rotateX(${rotate}deg)`;
        
        const dist = Math.abs(progress - 0.5);
        if (dist < minDist) { minDist = dist; closest = i; }
      });

      setActive(closest);
    });

    return () => lenis.destroy();
  }, []);

  return (
    <section ref={section} style={{ height: `${(ITEMS.length + 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen grid grid-cols-2 gap-12 px-12 overflow-hidden">
        <div className="flex flex-col justify-center">
          <p className="text-sm uppercase tracking-wide text-neutral-500">Featured Work</p>
          <h2 className="mt-4 text-4xl font-semibold">{ITEMS[active].title}</h2>
          <p className="mt-2 text-neutral-600 max-w-md">{ITEMS[active].desc}</p>
        </div>

        <div className="relative overflow-hidden">
          <div className="relative h-full" style={{ perspective: 800 }}>
            {ITEMS.map((item, i) => (
              <div
                key={i}
                ref={el => cards.current[i] = el}
                style={{ transform: "translateY(100vh) scale(1.1) rotateX(8deg)" }}
                className="absolute inset-0 m-auto h-[60vh] w-4/5 rounded-xl bg-neutral-200 flex items-center justify-center text-2xl font-medium will-change-transform"
              >
                {item.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}