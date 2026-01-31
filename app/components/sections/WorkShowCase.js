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
    <Tag className={`flex flex-col justify-center  ${className}`}>
      {text.split("\n").map((line, i) => (
        <span key={i} className="block overflow-hidden leading-tight">
          <span
            className="block animate-line will-change-transform "
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

  // Viewport detection
  useEffect(() => {
    setHasMounted(true);

    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkViewport();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newIsMobile = window.innerWidth < 768;
        if (newIsMobile !== isMobile) {
          // Force re-initialization by reloading the page
          window.location.reload();
        }
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [isMobile]);

  // Show loading during SSR/hydration
  if (!hasMounted) {
    return (
      <div className="h-screen bg-backgroundlight flex items-center justify-center">
        <div className="text-neutral-500">Loading showcase...</div>
      </div>
    );
  }

  return isMobile ? <MobileVersion /> : <DesktopVersion />;
}

/* ---------------------------------------------
   Desktop Version
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

  /* ---------------- Update Card Positions ---------------- */
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

  /* ---------------- Initialize Cards to Correct State ---------------- */
  const initializeCardsForPosition = useCallback(
    (scrollSinceStart) => {
      if (!isInitializedRef.current) {
        const vh = window.innerHeight;
        const totalAnimationScroll = ITEMS.length * vh;

        const clampedScroll = Math.max(
          -vh * 0.5,
          Math.min(scrollSinceStart, totalAnimationScroll + vh * 0.5),
        );

        updateCardPositions(clampedScroll);

        const progress = clampedScroll / vh;
        const initialIndex = Math.min(
          ITEMS.length - 1,
          Math.max(0, Math.floor(progress + 0.5)),
        );
        setActiveIndex(initialIndex);

        isInitializedRef.current = true;
      }
    },
    [updateCardPositions],
  );

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
  }, [updateCardPositions]);

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
        sectionBottomInViewport < -vh * 0.8 || sectionTopInViewport > vh * 1.8;

      // Activation: when section is entering viewport
      const shouldActivate =
        (sectionTopInViewport <= vh * 0.6 && sectionTopInViewport >= -vh) ||
        (scrollY > bounds.top && scrollY < bounds.bottom);

      if (!isActiveRef.current && shouldActivate) {
        // Consistent scroll start calculation
        const sectionTopAbsolute = bounds.top;
        const scrollStartAbsolute = sectionTopAbsolute - vh * 0.4;

        scrollStartRef.current = scrollStartAbsolute;

        const initialScrollSinceStart = scrollY - scrollStartAbsolute;
        initializeCardsForPosition(initialScrollSinceStart);

        isActiveRef.current = true;
        isInitializedRef.current = true;
      } else if (isActiveRef.current && shouldDeactivate) {
        isActiveRef.current = false;
        isInitializedRef.current = false;
      }
    };

    // Check initial state
    setTimeout(() => {
      handleScroll();
    }, 100);

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [initializeCardsForPosition]);

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

    window.addEventListener("resize", initCardsToDefault);
    return () => window.removeEventListener("resize", initCardsToDefault);
  }, []);

  /* ---------------- Render ---------------- */
  return (
    <section
      ref={sectionRef}
      className="bg-backgroundlight"
      style={{ height: `${(ITEMS.length + 1) * 100}vh` }}
    >
     
      <div className="sticky top-0 h-screen flex px-4 overflow-hidden">
        {/* LEFT */}
        <div
          key={activeIndex}
          className="w-2/5 flex flex-col justify-center pr-12 "
        >
          {/* <span className="absolute top-5 font-bold">
            [SELECTED]
          </span> */}
          <span className="absolute bottom-5 text-sm font-medium mr-50 flex gap-1 ">
            <span>[WORK / </span>

            <MaskedLines
              as="span"
              className=" text-sm "
              text={String(activeIndex + 1).padStart(2, "0")}
            />

            <span>]</span>
          </span>
          <MaskedLines
            as="h2"
            className="text-8xl font-bold tracking-[-0.04em]"
            text={ITEMS[activeIndex].title}
          />
          <div className="mt-3  max-w-md">
            <MaskedLines text={ITEMS[activeIndex].desc} className="text-2xl" />
          </div>
        </div>

        {/* RIGHT — 3D CARDS */}
        <div className="w-3/5 relative overflow-hidden ">
          <span className="absolute top-5 right-0 font-semibold">
            [2026 SHOWCASE]
          </span>
            <span className="absolute bottom-5 right-0 text-xl font-medium z-50">
            [SEE MORE]
          </span>
          <div className="relative h-full " style={{ perspective: 500 }}>
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

/* ---------------------------------------------
   Mobile Version
---------------------------------------------- */
function MobileVersion() {
  const cardRefs = useRef([]);
  const activated = useRef(new Set());
  const metrics = useRef({});

  /* ---------------- Activation ---------------- */
  useEffect(() => {
    const observers = ITEMS.map((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (
            !activated.current.has(i) &&
            entry.boundingClientRect.top <= window.innerHeight
          ) {
            activated.current.add(i);

            const rect = el.getBoundingClientRect();
            const scrollY = window.scrollY;
            const vh = window.innerHeight;

            const data = {
              start: scrollY + rect.top - vh,
              tiltEnd: scrollY + rect.top + rect.height * 0.7 - vh * 0.5,
              scaleEnd: scrollY + rect.bottom,
            };

            metrics.current[i] = data;
          }
        },
        { threshold: 0 },
      );

      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  /* ---------------- Resize Invalidation ---------------- */
  useEffect(() => {
    const onResize = () => {
      activated.current.clear();
      metrics.current = {};
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ---------------- Scroll Animation ---------------- */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      activated.current.forEach((i) => {
        const el = cardRefs.current[i];
        const m = metrics.current[i];
        if (!el || !m) return;

        const tiltProgress = Math.min(
          1,
          Math.max(0, (y - m.start) / (m.tiltEnd - m.start)),
        );

        const scaleProgress = Math.min(
          1,
          Math.max(0, (y - m.start) / (m.scaleEnd - m.start)),
        );

        const rotateX = 52 * (1 - tiltProgress);
        const scale = 1.4 - scaleProgress * 0.5;

        el.style.transform = `
          translateZ(120px)
          rotateX(${rotateX}deg)
          scale(${scale})
        `;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------------- Render ---------------- */
  return (
    <section className="px-6 py-16 space-y-10">
      <h2 className="text-3xl font-semibold">Featured Works</h2>

      <div className="grid grid-cols-1 gap-y-30 place-items-center w-full">
        {ITEMS.map((item, i) => (
          /* 3D STAGE */
          <div
            key={i}
            className="
              w-full flex justify-center p-6
              perspective-[900px]
              sm:perspective-[1800px]
              [transform-style:preserve-3d]
            "
          >
            {/* CARD */}
            <div
              ref={(el) => (cardRefs.current[i] = el)}
              data-card-index={i}
              className="
                relative
                rounded-xl h-[2vh] w-[60%]
                flex items-center justify-center p-6
                bg-neutral-200
                will-change-transform
                [transform-style:preserve-3d]
              "
              style={{
                transform: `
                  translateZ(120px)
                  rotateX(102deg)
                  scale(1.4)
                `,
                transformOrigin: "center top",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="text-center p-4 bg-white/30">
                <h3 className="text-xl font-medium">{item.title}</h3>
                <p className="mt-2">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
