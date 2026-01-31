"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
function MaskedLines({ text, as: Tag = "div", className }) {
  return (
    <Tag className={`flex flex-col ${className}`}>
      {text.split("\n").map((line, i) => (
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
   Work Showcase
---------------------------------------------- */
export default function WorkShowcase() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const isActiveRef = useRef(false);
  const scrollStartRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);

  const EFFECT_STOP = 0.9;
  const MAX_SCALE = 0.6;
  const MAX_ROTATE = 25;

  /* ---------------- Core Scroll Math ---------------- */
  const updateCardPositions = useCallback((scrollSinceStart) => {
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

      const d = Math.abs(progress - 0.5);
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    });

    setActiveIndex(closest);
  }, []);

  /* ---------------- Lenis ---------------- */
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });

    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    const onScroll = ({ scroll }) => {
      if (!isActiveRef.current) return;
      updateCardPositions(scroll - scrollStartRef.current);
    };

    lenis.on("scroll", onScroll);
    return () => lenis.destroy();
  }, [updateCardPositions]);

  /* ---------------- Sticky Activation ---------------- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const rect = section.getBoundingClientRect();

      const sectionTop = rect.top + scrollY;
      const sectionBottom = rect.bottom + scrollY;

      const shouldActivate =
        rect.top <= vh * 0.6 && rect.bottom >= vh * 0.4;

      const shouldDeactivate =
        rect.bottom < -vh || rect.top > vh * 2;

      if (!isActiveRef.current && shouldActivate) {
        scrollStartRef.current = sectionTop - vh * 0.4;
        isActiveRef.current = true;
        updateCardPositions(scrollY - scrollStartRef.current);
      }

      if (isActiveRef.current && shouldDeactivate) {
        isActiveRef.current = false;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateCardPositions]);

  /* ---------------- Render ---------------- */
  return (
    <section
      ref={sectionRef}
      className="bg-backgroundlight"
      style={{ height: `${(ITEMS.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex px-4 overflow-hidden">
        {/* LEFT */}
        <div className="w-2/5 flex flex-col justify-center pr-12">
          <span className="absolute bottom-5 text-sm font-medium flex gap-1">
            <span>[WORK /</span>
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

        {/* RIGHT — CARDS */}
        <div className="w-3/5 relative overflow-hidden">
          <span className="absolute top-5 right-0 font-semibold">
            [2026 SHOWCASE]
          </span>

          <span className="absolute bottom-5 right-0 text-xl font-medium z-50">
            [SEE MORE]
          </span>

          <div className="relative h-full" style={{ perspective: 500 }}>
            {ITEMS.map((item, i) => (
              <div
                key={i}
                ref={(el) => (cardsRef.current[i] = el)}
                className="absolute inset-0 m-auto h-[60vh] w-[70%] rounded-xl bg-neutral-200 flex items-center justify-center text-2xl font-medium will-change-transform"
                style={{
                  transform: "translateY(100vh)",
                }}
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
