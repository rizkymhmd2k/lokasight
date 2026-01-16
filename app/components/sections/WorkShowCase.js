"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

const ITEMS = [
  { title: "Project One", desc: "Description for project one" },
  { title: "Project Two", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

/* ---------------------------------------------
   Line Mask + Stagger Component
---------------------------------------------- */
function MaskedLines({ text, as: Tag = "div", className }) {
  const lines = text.split("\n");

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden leading-tight">
          <span
            className="block animate-line will-change-transform"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/* ---------------------------------------------
   Main Component
---------------------------------------------- */
export default function WorkShowcase() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const scrollStartRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const EFFECT_STOP = 0.9;
  const MAX_SCALE = 0.6;
  const MAX_ROTATE = 25;

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    const handleScroll = ({ scroll }) => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();

      if (rect.top > 0) {
        scrollStartRef.current = 0;
        setActiveIndex(0);
        return;
      }

      if (!scrollStartRef.current) {
        scrollStartRef.current = scroll;
      }

      const scrollSinceStart = scroll - scrollStartRef.current;
      const vh = window.innerHeight;

      let closest = 0;
      let minDist = Infinity;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const progress = (scrollSinceStart - i * vh) / vh;
        const y = (1 - progress) * vh;

        let scale = 1;
        let rotate = 0;

        if (progress < EFFECT_STOP) {
          const norm = 1 - progress / EFFECT_STOP;
          scale = 1 + MAX_SCALE * norm;
          rotate = MAX_ROTATE * norm;
        }

        card.style.transform = `
          translateY(${y}px)
          scale(${scale})
          rotateX(${rotate}deg)
        `;

        const dist = Math.abs(progress - 0.5);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });

      setActiveIndex(closest);
    };

    lenis.on("scroll", handleScroll);
    return () => lenis.destroy();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ height: `${(ITEMS.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex px-12 overflow-hidden">
        {/* LEFT — TEXT */}
        <div
          key={activeIndex}
          className="w-2/5 flex flex-col justify-center pr-12"
        >
          <p className="text-sm uppercase tracking-wide text-neutral-500 mb-4">
            Featured Work
          </p>

          <MaskedLines
            as="h2"
            className="text-4xl font-semibold"
            text={ITEMS[activeIndex].title}
          />

          <div className="mt-3 text-neutral-600 max-w-md">
            <MaskedLines text={ITEMS[activeIndex].desc} />
          </div>
        </div>

        {/* RIGHT — CARDS */}
        <div className="w-3/5 relative overflow-hidden">
          <div className="relative h-full" style={{ perspective: 500 }}>
            {ITEMS.map((item, i) => (
              <div
                key={i}
                ref={(el) => (cardsRef.current[i] = el)}
                className="absolute inset-0 m-auto h-[60vh] w-[70%] rounded-xl bg-neutral-200 flex items-center justify-center text-2xl font-medium will-change-transform"
                style={{
                  transform: `
                    translateY(100vh)
                    scale(${1 + MAX_SCALE})
                    rotateX(${MAX_ROTATE}deg)
                  `,
                }}
              >
                {item.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inline animation (can be moved to global CSS) */}
      <style jsx global>{`
        @keyframes lineReveal {
          from {
            transform: translateY(120%);
            opacity: 0;
          }
          to {
            transform: translateY(0%);
            opacity: 1;
          }
        }

        .animate-line {
          animation: lineReveal 0.55s cubic-bezier(0.25, 1, 0.5, 1) both;
        }
      `}</style>
    </section>
  );
}
