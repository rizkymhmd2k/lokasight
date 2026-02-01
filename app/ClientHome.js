"use client";

import { useEffect, useRef, useState } from "react";
import Hero from "./components/sections/Hero";
import Work from "./components/sections/Work";
import WorkShowCase from "./components/sections/WorkShowCase";
import Services from "./components/sections/Services";

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
   Page
---------------------------------------------- */
export default function ClientHome() {
  const heroRef = useRef(null);
  const heroDimRef = useRef(null);
  const heroZoneRef = useRef(null);

  useEffect(() => {
    const heroZone = heroZoneRef.current;
    const dim = heroDimRef.current;
    if (!heroZone || !dim) return;

    const onScroll = () => {
      const rect = heroZone.getBoundingClientRect();

      const progress = Math.min(
        Math.max(-rect.top / (rect.height - window.innerHeight), 0),
        1
      );

      dim.style.opacity = String(progress * 0.7);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="w-full">
      {/* DEV ONLY BREAKPOINT HELPER */}
      {process.env.NODE_ENV === "development" && <BreakpointIndicator />}

      {/* ---------------------------------------------
         HERO PIN ZONE
      ---------------------------------------------- */}
      <section ref={heroZoneRef} className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div ref={heroRef} className="relative h-full">
            <Hero />

            {/* DIM OVERLAY */}
            <div
              ref={heroDimRef}
              className="pointer-events-none absolute inset-0 bg-black opacity-0"
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------
         CONTENT OVERLAY
      ---------------------------------------------- */}
      <section
        className="
          relative z-10
          min-h-screen
          -mt-[100vh]
          bg-neutral-950
          rounded-t-4xl
        "
      >
        <Work />
        <WorkShowCase />
        <Services />
      </section>
    </main>
  );
}
