"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

const ITEMS = [
  { title: "Project One", desc: "Description for project one" },
  { title: "Project Two", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

/* ---------------------------------------------
   Line Mask
---------------------------------------------- */
function MaskedLines({ text, as: Tag = "div", className }) {
  return (
    <Tag className={className}>
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
   Main Component
---------------------------------------------- */
export default function WorkShowcase() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const isActiveRef = useRef(false);
  const scrollStartRef = useRef(0);
  const isInitializedRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const EFFECT_STOP = 0.9;
  const MAX_SCALE = 0.6;
  const MAX_ROTATE = 25;

  /* ---------------- Update Card Positions ---------------- */
  const updateCardPositions = (scrollSinceStart) => {
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
  };

  /* ---------------- Initialize Cards to Correct State ---------------- */
  const initializeCardsForPosition = (scrollSinceStart) => {
    if (!isInitializedRef.current) {
      const vh = window.innerHeight;
      const totalAnimationScroll = ITEMS.length * vh;
      
      const clampedScroll = Math.max(-vh * 0.5, Math.min(scrollSinceStart, totalAnimationScroll + vh * 0.5));
      
      updateCardPositions(clampedScroll);
      
      const progress = clampedScroll / vh;
      const initialIndex = Math.min(
        ITEMS.length - 1, 
        Math.max(0, Math.floor(progress + 0.5))
      );
      setActiveIndex(initialIndex);
      
      isInitializedRef.current = true;
    }
  };

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

      const scrollSinceStart = scroll - scrollStartRef.current;
      updateCardPositions(scrollSinceStart);
    };

    lenis.on("scroll", onScroll);
    return () => lenis.destroy();
  }, []);

  /* ---------------- Intersection Activation ---------------- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const updateSectionBounds = () => {
      const rect = section.getBoundingClientRect();
      return {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
      };
    };

    const handleScroll = () => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const sectionRect = section.getBoundingClientRect();
      const bounds = updateSectionBounds();
      
      const sectionTopInViewport = sectionRect.top;
      const sectionBottomInViewport = sectionRect.bottom;
      
      // Deactivation: when section is completely out of view
      const shouldDeactivate = 
        sectionBottomInViewport < -vh * 0.8 || 
        sectionTopInViewport > vh * 1.8;
      
      // Activation: when section is entering viewport
      const shouldActivate = 
        (sectionTopInViewport <= vh * 0.6 && sectionTopInViewport >= -vh) ||
        (scrollY > bounds.top && scrollY < bounds.bottom);
      
      if (!isActiveRef.current && shouldActivate) {
        // Consistent scroll start calculation
        const sectionTopAbsolute = bounds.top;
        const scrollStartAbsolute = sectionTopAbsolute - (vh * 0.4);
        
        scrollStartRef.current = scrollStartAbsolute;
        
        const initialScrollSinceStart = scrollY - scrollStartAbsolute;
        initializeCardsForPosition(initialScrollSinceStart);
        
        isActiveRef.current = true;
        isInitializedRef.current = true;
      } 
      else if (isActiveRef.current && shouldDeactivate) {
        isActiveRef.current = false;
        isInitializedRef.current = false;
      }
    };

    // Check initial state
    setTimeout(() => {
      handleScroll();
    }, 100);

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  /* ---------------- Initialize Cards to Default ---------------- */
  useEffect(() => {
    const initCardsToDefault = () => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        card.style.transform = `
          translateY(100vh)
          scale(${1 + MAX_SCALE})
          rotateX(${MAX_ROTATE}deg)
        `;
      });
    };

    setTimeout(initCardsToDefault, 50);
    
    window.addEventListener('resize', initCardsToDefault);
    return () => window.removeEventListener('resize', initCardsToDefault);
  }, []);

  /* ---------------- Render ---------------- */
  return (
    <section
      ref={sectionRef}
      className="bg-backgroundlight"
      style={{ height: `${(ITEMS.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex px-12 overflow-hidden">
        {/* LEFT */}
        <div
          key={activeIndex}
          className="w-2/5 flex flex-col justify-center pr-12"
        >
          <p className="text-sm uppercase tracking-wide text-neutral-500 mb-4">
            Featured Work
          </p>

          <MaskedLines
            as="h2"
            className="text-4xl font-semibold"
            text={ITEMS[activeIndex].title}
          />

          <div className="mt-3 text-neutral-600 max-w-md">
            <MaskedLines text={ITEMS[activeIndex].desc} />
          </div>
        </div>

        {/* RIGHT — 3D CARDS */}
        <div className="w-3/5 relative overflow-hidden">
          <div className="relative h-full" style={{ perspective: 500 }}>
            {ITEMS.map((item, i) => (
              <div
                key={i}
                ref={(el) => (cardsRef.current[i] = el)}
                className="absolute inset-0 m-auto h-[60vh] w-[70%] rounded-xl bg-neutral-200 flex items-center justify-center text-2xl font-medium will-change-transform"
                style={{
                  transform: `
                    translateY(100vh)
                    scale(${1 + MAX_SCALE})
                    rotateX(${MAX_ROTATE}deg)
                  `,
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