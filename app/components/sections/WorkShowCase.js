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
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const startScrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });

    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    const vh = window.innerHeight;
    const centerY = vh / 2;

    const onScroll = ({ scroll }) => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();

      // before pin
      if (rect.top > 0) {
        startScrollRef.current = null;
        setActiveIndex(0);
        return;
      }

      // capture pin start
      if (startScrollRef.current === null) {
        startScrollRef.current = scroll;
        return;
      }

      const delta = scroll - startScrollRef.current;
      const perCard = vh;

      let closestIndex = 0;
      let closestDistance = Infinity;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const local = delta - i * perCard;
        const y = vh - local;

        // move card vertically
        card.style.transform = `translateY(${y}px)`;

        // Calculate card's vertical position relative to viewport
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.top + cardRect.height / 2;
        
        // Calculate distance from viewport center (normalized from 0 to 1)
        // 0 = at viewport center, 1 = at viewport edge
        const distanceFromCenter = Math.abs(cardCenter - centerY);
        const normalizedDistance = Math.min(distanceFromCenter / (vh / 2), 1);

        // Apply scaling and perspective effect based on distance from center
        // Only apply effect when card is BELOW center (approaching from bottom)
        // When card is AT or ABOVE center, use final values (no effect)
        
        let scale = 1.0;
        let rotateX = 0;
        
        if (cardCenter > centerY) {
          // Card is below center - apply effect
          // Scale: from 1.1 (far from center) to 1.0 (at center)
          scale = 1.0 + (0.1 * normalizedDistance);
          
          // Rotation: from 8° (far from center) to 0° (at center)
          // Creates trapezoid effect when rotated with perspective
          rotateX = 8 * normalizedDistance;
        } else {
          // Card is at or above center - no effect (final state)
          scale = 1.0;
          rotateX = 0;
        }

        // Apply the 3D transform with perspective
        card.style.transform = `translateY(${y}px) scale(${scale}) rotateX(${rotateX}deg)`;
        card.style.transformOrigin = 'center center';

        // dominance check for active index
        const distance = Math.abs(cardCenter - centerY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });

      setActiveIndex(closestIndex);
    };

    lenis.on("scroll", onScroll);

    return () => {
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ height: `${(ITEMS.length + 1) * 100}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen grid grid-cols-2 gap-12 px-12 overflow-hidden">
        {/* LEFT */}
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

        {/* RIGHT with perspective container */}
        <div className="relative overflow-hidden">
          <div className="relative h-full" style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}>
            {ITEMS.map((item, i) => (
              <div
                key={item.title}
                ref={(el) => (cardsRef.current[i] = el)}
                style={{ 
                  transform: 'translateY(100vh) scale(1.1) rotateX(8deg)',
                  transformOrigin: 'center center'
                }}
                className="absolute inset-0 m-auto h-[60vh] w-[80%]
                           rounded-xl bg-neutral-200 flex items-center
                           justify-center text-2xl font-medium
                           will-change-transform transition-transform duration-75"
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