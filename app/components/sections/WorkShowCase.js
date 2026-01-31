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
   Mobile Work Showcase (Simple Column)
---------------------------------------------- */
function MobileWorkShowcase() {
  return (
    <section className="bg-backgroundlight px-4 py-10 lg:hidden">
      <div className="flex items-center justify-between mb-6">
        <span className="font-semibold">2026 SHOWCASE</span>
        <span className="text-sm font-medium opacity-70">[WORK]</span>
      </div>

      <div className="flex flex-col gap-4">
        {ITEMS.map((item, i) => (
          <article
            key={i}
            className="rounded-xl bg-neutral-200 p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
              <span className="text-sm font-medium opacity-70">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <p className="text-base opacity-80">{item.desc}</p>

            <button className="mt-2 self-start text-sm font-semibold">
              [SEE MORE]
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------
   Desktop Work Showcase (Fixed start at RED border)
---------------------------------------------- */
function DesktopWorkShowcase() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null); // ✅ red border/sticky wrapper ref
  const cardsRef = useRef([]);
  const stickyStartRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const EFFECT_STOP = 0.9;
  const MAX_SCALE = 0.6;
  const MAX_ROTATE = 25;

  const FOCUS = 0.8;
  const SWITCH_MARGIN = 0.16;

  const getProgress = useCallback((scrollSinceStart, i, vh) => {
    return (scrollSinceStart - i * vh) / vh;
  }, []);

  const apply = useCallback(
    (scrollSinceStart) => {
      const vh = window.innerHeight;

      let bestIndex = 0;
      let bestDist = Infinity;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const progress = getProgress(scrollSinceStart, i, vh);
        const y = (1 - progress) * vh;

        let scale = 1;
        let rotate = 0;

        if (progress < EFFECT_STOP) {
          const norm = 1 - progress / EFFECT_STOP;
          scale = 1 + MAX_SCALE * norm;
          rotate = MAX_ROTATE * norm;
        }

        card.style.transform = `translateY(${y}px) scale(${scale}) rotateX(${rotate}deg)`;

        const dist = Math.abs(progress - FOCUS);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      });

      setActiveIndex((prev) => {
        if (prev === bestIndex) return prev;

        const prevProgress = getProgress(scrollSinceStart, prev, vh);
        const prevDist = Math.abs(prevProgress - FOCUS);

        const improvedBy = prevDist - bestDist;
        if (improvedBy > SWITCH_MARGIN) return bestIndex;

        return prev;
      });
    },
    [EFFECT_STOP, MAX_SCALE, MAX_ROTATE, FOCUS, SWITCH_MARGIN, getProgress],
  );

  const setPreStickyState = useCallback(() => {
    const vh = window.innerHeight;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const y = i === 0 ? 0 : vh;
      const scale = i === 0 ? 1 : 1 + MAX_SCALE;
      const rotate = i === 0 ? 0 : MAX_ROTATE;

      card.style.transform = `translateY(${y}px) scale(${scale}) rotateX(${rotate}deg)`;
    });

    setActiveIndex(0);
  }, [MAX_SCALE, MAX_ROTATE]);

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
      const sticky = stickyRef.current;
      if (!section || !sticky) return;

      const sectionRect = section.getBoundingClientRect();
      const stickyRect = sticky.getBoundingClientRect();
      const vh = window.innerHeight;

      const near = sectionRect.top < vh * 1.2 && sectionRect.bottom > -vh * 0.2;
      if (!near) return;

      // ✅ Start condition is now based on the RED border/sticky wrapper
      if (stickyRect.top > 0) {
        stickyStartRef.current = null;
        setPreStickyState();
        return;
      }

      if (stickyStartRef.current == null) {
        stickyStartRef.current = window.scrollY;
      }

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

  return (
    <section
      ref={sectionRef}
      className="bg-backgroundlight hidden lg:block"
      style={{ height: `${(ITEMS.length + 1) * 100}vh` }}
    >
      <h1 className="pt-20 sm:pt-20 text-8xl lg:text-[250px] font-medium mr-50 tracking-[-0.04em] border border-blue-700">
        FEATURED
      </h1>

      <div
        ref={stickyRef} // ✅ this is the red border whose top must hit viewport top
        className="sticky top-0 h-screen flex px-4 overflow-hidden border border-red-800"
      >
        {/* LEFT */}
        <div key={activeIndex} className="w-2/5 flex flex-col justify-center pr-12">
          <span className="absolute top-5 left-5 font-semibold">XFEATUREDX</span>

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
          <span className="absolute top-5 right-0 font-semibold">2026 SHOWCASE</span>
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

export default function WorkShowcase() {
  return (
    <>
      <MobileWorkShowcase />
      <DesktopWorkShowcase />
    </>
  );
}
