"use client";

import { useRef, useEffect } from "react";

const ITEMS = [
  { title: "Project One", desc: "Description for project one" },
  { title: "Project Two", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

export default function WorkShowcase() {
  const cardRefs = useRef([]);
  const activated = useRef(new Set());
  const metrics = useRef({});

  /* ---------------- Activation ---------------- */
  useEffect(() => {
    const observers = ITEMS.map((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (
            !activated.current.has(i) &&
            entry.boundingClientRect.top <= window.innerHeight
          ) {
            activated.current.add(i);

            const rect = el.getBoundingClientRect();
            const scrollY = window.scrollY;
            const vh = window.innerHeight;

            metrics.current[i] = {
              start: scrollY + rect.top - vh,
              tiltEnd: scrollY + rect.top + rect.height * 0.7 - vh * 0.5,
              scaleEnd: scrollY + rect.bottom,
            };
          }
        },
        { threshold: 0 }
      );

      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  /* ---------------- Scroll Animation ---------------- */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      activated.current.forEach((i) => {
        const el = cardRefs.current[i];
        const m = metrics.current[i];
        if (!el || !m) return;

        // Tilt stops earlier (around 70%)
        const tiltProgress = Math.min(
          1,
          Math.max(0, (y - m.start) / (m.tiltEnd - m.start))
        );

        // Scale continues until card leaves viewport
        const scaleProgress = Math.min(
          1,
          Math.max(0, (y - m.start) / (m.scaleEnd - m.start))
        );

        const rotateX = 52 * (1 - tiltProgress);
        const scale = 1.4 - scaleProgress * 0.5;

        el.style.transform = `
          translateZ(120px)
          rotateX(${rotateX}deg)
          scale(${scale})
        `;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------------- Render ---------------- */
  return (
    <section className="px-6 py-16 space-y-10">
      <h2 className="text-3xl font-semibold">Featured Works</h2>

      <div className="grid grid-cols-1 gap-y-40 place-items-center w-full">
        {ITEMS.map((item, i) => {
          const isMobile =
            typeof window !== "undefined" && window.innerWidth < 640;

          return (
            /* 3D STAGE */
            <div
              key={i}
              className="w-full flex justify-center p-6 border-4 border-red-500"
              style={{
                perspective: isMobile ? "900px" : "1800px",
                WebkitPerspective: isMobile ? "900px" : "1800px",
                transformStyle: "preserve-3d",
                WebkitTransformStyle: "preserve-3d",
              }}
            >
              {/* CARD */}
              <div
                ref={(el) => (cardRefs.current[i] = el)}
                className="
                  rounded-xl h-[50vh] w-[60%]
                  flex items-center justify-center p-6
                  bg-yellow-500
                  border-4 border-green-500
                  will-change-transform
                "
                style={{
                  transform: `
                    translateZ(120px)
                    rotateX(52deg)
                    scale(1.4)
                  `,
                  transformOrigin: "center top",
                  transformStyle: "preserve-3d",
                  WebkitTransformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <div className="text-center border border-black p-4 bg-white/30">
                  <h3 className="text-xl font-medium">{item.title}</h3>
                  <p className="mt-2">{item.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
