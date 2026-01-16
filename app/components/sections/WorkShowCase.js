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
  // DOM references
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  
  // Animation state
  const scrollStartRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Animation settings
  const EFFECT_STOP = 0.9;
  const MAX_SCALE = 0.6;
  const MAX_ROTATE = 25;

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });
    
    const animate = (time) => {
      lenis.raf(time);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    const handleScroll = ({ scroll }) => {
      const section = sectionRef.current;
      if (!section) return;

      const sectionRect = section.getBoundingClientRect();
      
      if (sectionRect.top > 0) {
        scrollStartRef.current = 0;
        setActiveIndex(0);
        return;
      }

      if (scrollStartRef.current === 0) {
        scrollStartRef.current = scroll;
      }

      const scrollSinceStart = scroll - scrollStartRef.current;
      const vh = window.innerHeight;

      let closest = 0, minDist = Infinity;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const progress = (scrollSinceStart - i * vh) / vh;
        const y = (1 - progress) * vh;

        let scale = 1, rotate = 0;
        
        if (progress < EFFECT_STOP) {
          const norm = 1 - (progress / EFFECT_STOP);
          scale = 1 + MAX_SCALE * norm;
          rotate = MAX_ROTATE * norm;
        }

        card.style.transform = `translateY(${y}px) scale(${scale}) rotateX(${rotate}deg)`;
        
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
    <section ref={sectionRef} style={{ height: `${(ITEMS.length + 1) * 100}vh` }}>
      {/* Changed from grid to flex with 40/60 split */}
      <div className="sticky top-0 h-screen flex px-12 overflow-hidden">
        
        {/* Left column: 40% width for text */}
        <div className="w-2/5 flex flex-col justify-center pr-12">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            Featured Work
          </p>
          <h2 className="mt-4 text-4xl font-semibold">
            {ITEMS[activeIndex].title}
          </h2>
          <p className="mt-2 text-neutral-600 max-w-md">
            {ITEMS[activeIndex].desc}
          </p>
        </div>

        {/* Right column: 60% width for cards */}
        <div className="w-3/5 relative overflow-hidden">
          <div className="relative h-full" style={{ perspective: 500 }}>
            {ITEMS.map((item, i) => (
              <div
                key={i}
                ref={el => cardsRef.current[i] = el}
                style={{ 
                  transform: `translateY(100vh) scale(${1 + MAX_SCALE}) rotateX(${MAX_ROTATE}deg)` 
                }}
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