"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Lenis from "lenis";

const ITEMS = [
  { title: "GARIS KARSA", desc: "Description for project one" },
  { title: "BLACK ROCK INC", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

/* ---------------------------------------------
   Line Mask Component
---------------------------------------------- */
function MaskedLines({ text, as: Tag = "div", className = "" }) {
  const lines = useMemo(() => String(text).split("\n"), [text]);

  return (
    <Tag className={`flex flex-col justify-center ${className}`}>
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
   Desktop Work Showcase
---------------------------------------------- */
export default function WorkShowcase() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const stickyStartRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const EFFECT_STOP = 0.9;
  const MAX_SCALE = 0.6;
  const MAX_ROTATE = 25;

  /* ---------------- Main Animation ---------------- */
  const apply = useCallback((scrollSinceStart) => {
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

      card.style.transform = `translateY(${y}px) scale(${scale}) rotateX(${rotate}deg)`;

      const d = Math.abs(progress - 0.5);
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    });

    setActiveIndex((prev) => (prev === closest ? prev : closest));
  }, []);

  /* ---------------- Pre-sticky State (Card 0 centered) ---------------- */
  const setPreStickyState = useCallback(() => {
    const vh = window.innerHeight;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      // Match EXACTLY what apply(vh) would produce
      const y = i === 0 ? 0 : vh;
      const scale = i === 0 ? 1 : 1 + MAX_SCALE;
      const rotate = i === 0 ? 0 : MAX_ROTATE;

      card.style.transform = `translateY(${y}px) scale(${scale}) rotateX(${rotate}deg)`;
    });

    setActiveIndex(0);
  }, []);

  /* ---------------- Lenis ---------------- */
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });

    let rafId;
    const raf = (t) => {
      lenis.raf(t);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const update = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      // perf: ignore when far away
      const near = rect.top < vh * 1.2 && rect.bottom > -vh * 0.2;
      if (!near) return;

      // BEFORE sticky: keep first card centered, and reset sticky start
      if (rect.top > 0) {
        stickyStartRef.current = null;
        setPreStickyState();
        return;
      }

      // STICKY active:
      // lock the scroll position when we FIRST enter sticky
      if (stickyStartRef.current == null) {
        stickyStartRef.current = window.scrollY;
      }

      // IMPORTANT:
      // At sticky start, we want card 0 to be centered.
      // With your formula, that happens when scrollSinceStart === vh.
      const sinceStart = window.scrollY - stickyStartRef.current + vh;

      apply(sinceStart);
    };

    lenis.on("scroll", update);
    window.addEventListener("resize", update);
    update();

    return () => {
      lenis.off("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [apply, setPreStickyState]);

  /* ---------------- Render ---------------- */
  return (
    <section
      ref={sectionRef}
      className="bg-backgroundlight"
      style={{ height: `${(ITEMS.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex px-4 overflow-hidden">
        {/* LEFT */}
        <div key={activeIndex} className="w-2/5 flex flex-col justify-center pr-12">
          <span className="absolute bottom-5 text-sm font-medium mr-50 flex gap-1">
            <span>[WORK / </span>
            <MaskedLines
              as="span"
              className="text-sm"
              text={String(activeIndex + 1).padStart(2, "0")}
            />
            <span>]</span>
          </span>

          <MaskedLines
            as="h2"
            className="text-8xl font-bold tracking-[-0.04em]"
            text={ITEMS[activeIndex].title}
          />
          <div className="mt-3 max-w-md">
            <MaskedLines text={ITEMS[activeIndex].desc} className="text-2xl" />
          </div>
        </div>

        {/* RIGHT — 3D CARDS */}
        <div className="w-3/5 relative overflow-hidden">
          <span className="absolute top-5 right-0 font-semibold">[2026 SHOWCASE]</span>
          <span className="absolute bottom-5 right-0 text-xl font-medium z-50">
            [SEE MORE]
          </span>

          <div className="relative h-full" style={{ perspective: 500 }}>
            {ITEMS.map((item, i) => (
              <div
                key={i}
                ref={(el) => {
                  if (el) cardsRef.current[i] = el;
                }}
                className="absolute inset-0 m-auto h-[60vh] w-[70%] rounded-xl bg-neutral-200 flex items-center justify-center text-2xl font-medium will-change-transform"
              >
                {item.title}
              </div>
            ))}
          </div>
        </div>
      </div>

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
