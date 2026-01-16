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

  useEffect(() => {
    // 1. Setup smooth scrolling
    const lenis = new Lenis({ lerp: 0.08 });
    
    // 2. Animation frame loop
    const animate = (time) => {
      lenis.raf(time);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    // 3. Handle scroll events
    const handleScroll = ({ scroll }) => {
      const section = sectionRef.current;
      if (!section) return;

      // Get section position
      const sectionRect = section.getBoundingClientRect();
      
      // If section is above viewport (not yet pinned)
      if (sectionRect.top > 0) {
        scrollStartRef.current = 0;
        setActiveIndex(0);
        return;
      }

      // Record start position when section first reaches top
      if (scrollStartRef.current === 0) {
        scrollStartRef.current = scroll;
      }

      // Calculate scroll since pinning started
      const scrollSinceStart = scroll - scrollStartRef.current;
      const viewportHeight = window.innerHeight;

      let closestIndex = 0;
      let smallestDistance = Infinity;

      // Update each card
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        // Calculate progress: 0 = entering bottom, 1 = exiting top
        const progress = (scrollSinceStart - index * viewportHeight) / viewportHeight;
        
        // Calculate vertical position
        const yPosition = (1 - progress) * viewportHeight;

        // Calculate scale and rotation
        let scale = 1;
        let rotate = 0;
        
        // Only apply effects when card is below center
        if (progress < 0.5) {
          const effectStrength = 1 - (progress * 2); // Goes from 1 to 0
          scale = 1 + 0.6 * effectStrength;  // 1.6 → 1.0
          rotate = 25 * effectStrength;      // 25° → 0°
        }

        // Apply transform to card
        card.style.transform = `translateY(${yPosition}px) scale(${scale}) rotateX(${rotate}deg)`;

        // Find which card is closest to center
        const distanceFromCenter = Math.abs(progress - 0.5);
        if (distanceFromCenter < smallestDistance) {
          smallestDistance = distanceFromCenter;
          closestIndex = index;
        }
      });

      // Update active project display
      setActiveIndex(closestIndex);
    };

    lenis.on("scroll", handleScroll);

    // Cleanup
    return () => lenis.destroy();
  }, []);

  return (
    <section ref={sectionRef} style={{ height: `${(ITEMS.length + 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen grid grid-cols-2 gap-12 px-12 overflow-hidden">
        <div className="flex flex-col justify-center">
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

        <div className="relative overflow-hidden">
          <div className="relative h-full" style={{ perspective: 500 }}>
            {ITEMS.map((item, i) => (
              <div
                key={i}
                ref={el => cardsRef.current[i] = el}
                style={{ transform: "translateY(100vh) scale(1.3) rotateX(25deg)" }}
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