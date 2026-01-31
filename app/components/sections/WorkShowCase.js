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
    <Tag className={`flex flex-col justify-center ${className}`}>
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
   Responsive Work Showcase
---------------------------------------------- */
export default function WorkShowcase() {
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const check = () => setIsMobile(window.innerWidth < 768);
    check();

    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const next = window.innerWidth < 768;
        if (next !== isMobile) window.location.reload();
      }, 200);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isMobile]);

  if (!hasMounted) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return isMobile ? <MobileVersion /> : <DesktopVersion />;
}

/* ---------------------------------------------
   Desktop Version (NO absolute cards)
---------------------------------------------- */
function DesktopVersion() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const isActiveRef = useRef(false);
  const scrollStartRef = useRef(0);
  const isInitializedRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const EFFECT_STOP = 0.9;
  const MAX_SCALE = 0.6;
  const MAX_ROTATE = 25;

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
        const n = 1 - progress / EFFECT_STOP;
        scale = 1 + MAX_SCALE * n;
        rotate = MAX_ROTATE * n;
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

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });

    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    lenis.on("scroll", ({ scroll }) => {
      if (!isActiveRef.current) return;
      updateCardPositions(scroll - scrollStartRef.current);
    });

    return () => lenis.destroy();
  }, [updateCardPositions]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const vh = window.innerHeight;
      const y = window.scrollY;
      const rect = section.getBoundingClientRect();
      const top = rect.top + y;

      const activate =
        rect.top <= vh * 0.6 && rect.bottom >= vh * 0.4;

      if (!isActiveRef.current && activate) {
        scrollStartRef.current = top - vh * 0.4;
        updateCardPositions(y - scrollStartRef.current);
        isActiveRef.current = true;
      }

      if (
        isActiveRef.current &&
        (rect.bottom < -vh || rect.top > vh * 2)
      ) {
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

  useEffect(() => {
    cardsRef.current.forEach((card) => {
      if (!card) return;
      card.style.transform = `
        translateY(100vh)
        scale(${1 + MAX_SCALE})
        rotateX(${MAX_ROTATE}deg)
      `;
    });
  }, []);

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
              text={String(activeIndex + 1).padStart(2, "0")}
            />
            <span>]</span>
          </span>

          <MaskedLines
            as="h2"
            className="text-8xl font-bold tracking-[-0.04em]"
            text={ITEMS[activeIndex].title}
          />
          <MaskedLines
            className="text-2xl mt-3 max-w-md"
            text={ITEMS[activeIndex].desc}
          />
        </div>

        {/* RIGHT — GRID STACK */}
        <div className="w-3/5 relative overflow-hidden">
          <span className="absolute top-5 right-0 font-semibold">
            [2026 SHOWCASE]
          </span>

          <div
            className="grid h-full place-items-center"
            style={{ perspective: 500 }}
          >
            {ITEMS.map((item, i) => (
              <div
                key={i}
                ref={(el) => (cardsRef.current[i] = el)}
                className="
                  col-start-1 row-start-1
                  h-[60vh] w-[70%]
                  rounded-xl bg-neutral-200
                  flex items-center justify-center
                  text-2xl font-medium
                  will-change-transform
                "
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

/* ---------------------------------------------
   Mobile Version (UNCHANGED)
---------------------------------------------- */
function MobileVersion() {
  return (
    <section className="px-6 py-16 space-y-10">
      <h2 className="text-3xl font-semibold">Featured Works</h2>
      <p>Mobile logic unchanged</p>
    </section>
  );
}
