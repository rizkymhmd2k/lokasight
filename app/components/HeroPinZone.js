"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ---------------------------------------------
   Breakpoint Indicator (DEV HELPER)
---------------------------------------------- */
function BreakpointIndicator() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="fixed top-4 left-4 z-[9999] rounded-xl bg-black/80 px-3 py-2 text-xs font-mono text-white backdrop-blur">
      <div className="leading-none">{width}px</div>

      <div className="mt-1 opacity-70">
        <span className="block sm:hidden">xs</span>
        <span className="hidden sm:block md:hidden">sm</span>
        <span className="hidden md:block lg:hidden">md</span>
        <span className="hidden lg:block xl:hidden">lg</span>
        <span className="hidden xl:block 2xl:hidden">xl</span>
        <span className="hidden 2xl:block">2xl</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   Hero Pin Zone
---------------------------------------------- */
export default function HeroPinZone({ children }) {
  const heroZoneRef = useRef(null);
  const heroDimRef = useRef(null);

  const metricsRef = useRef({ top: 0, range: 1 });
  const rafRef = useRef(0);
  const lastScrollRef = useRef(0);
  const activeRef = useRef(false);

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const measure = useCallback(() => {
    const heroZone = heroZoneRef.current;
    if (!heroZone) return;

    const rect = heroZone.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const top = rect.top + scrollY;
    const range = Math.max(rect.height - window.innerHeight, 1);

    metricsRef.current = { top, range };
  }, []);

  const apply = useCallback(() => {
    const dim = heroDimRef.current;
    if (!dim) return;

    const { top, range } = metricsRef.current;
    const progress = clamp((lastScrollRef.current - top) / range, 0, 1);
    dim.style.opacity = String(progress * 0.7);

    rafRef.current = 0;
  }, []);

  useEffect(() => {
    const heroZone = heroZoneRef.current;
    const dim = heroDimRef.current;
    if (!heroZone || !dim) return;

    const onScroll = () => {
      lastScrollRef.current = window.scrollY || window.pageYOffset;
      if (!activeRef.current) return;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(apply);
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        activeRef.current = entry.isIntersecting;
        if (entry.isIntersecting) onScroll();
      },
      { rootMargin: "200px 0px 200px 0px", threshold: 0 }
    );

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            measure();
            onScroll();
          })
        : null;

    measure();
    onScroll();

    io.observe(heroZone);
    if (ro) ro.observe(heroZone);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      if (ro) ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [apply, measure]);

  return (
    <section ref={heroZoneRef} className="relative h-[200vh]">
      {process.env.NODE_ENV === "development" && <BreakpointIndicator />}

      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="relative h-full">
          {children}

          <div
            ref={heroDimRef}
            className="pointer-events-none absolute inset-0 bg-black opacity-0 will-change-opacity"
          />
        </div>
      </div>
    </section>
  );
}
