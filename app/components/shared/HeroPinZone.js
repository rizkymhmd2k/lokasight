"use client";

import { useEffect, useRef } from "react";

export default function HeroPinZone({ children }) {
  const sectionRef = useRef(null);
  const dimRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const dim = dimRef.current;
    if (!section || !dim) return;

    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const viewportHeight = window.innerHeight;
        
        // Calculate how far we've scrolled into the section
        const scrolled = -sectionTop;
        const scrollRange = sectionHeight - viewportHeight;
        const startOffset = scrollRange * 0.12;
        
        // Progress from 0 to 1
        const progress = Math.max(0, Math.min(1, 
          (scrolled - startOffset) / scrollRange
        ));
        
        dim.style.opacity = progress * 0.7;
        rafId = null;
      });
    };

    handleScroll(); // Initial call
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="relative h-full">
          {children}
          <div
            ref={dimRef}
            className="pointer-events-none absolute inset-0 bg-black opacity-0 will-change-opacity"
          />
        </div>
      </div>
    </section>
  );
}