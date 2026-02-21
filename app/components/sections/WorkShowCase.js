"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

const ITEMS = [
  { id: "garis-karsa", title: "GARIS\nKARSA", desc: "Description for project one" },
  { id: "black-rock", title: "BLACK\nROCK", desc: "Description for project two" },
  { id: "project-three", title: "Project\nThree", desc: "Description for project three" },
  { id: "project-four", title: "Project\nFour", desc: "Description for project four" },
];

const CONFIG = {
  MAX_ROTATE: 45,
  SMOOTH: 0.08,
  EPS: 0.001,
  ANIM_DELAY: 0.12,
  MIN_SCALE: 0.85,
  LIST_SMOOTH: 0.085,
  LIST_EPS: 0.15,
  CARD_HEIGHT_VH: 0.5,
  ACTIVE_VISIBILITY_THRESHOLD: 0.2,
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const MaskedLines = memo(function MaskedLines({
  text,
  as: Tag = "div",
  className = "",
}) {
  const lines = useMemo(() => String(text).split("\n"), [text]);

  return (
    <Tag className={`flex flex-col justify-center leading-[1.2] ${className}`}>
      {lines.map((line, i) => (
        <span
          key={i}
          className={`block overflow-hidden ${i === 0 ? "" : "-mt-[0.28em]"}`}
        >
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
});

function MobileWorkShowcase() {
  const handleProjectClick = useCallback((index) => {
    console.log(`View project ${index + 1}`);
  }, []);

  return (
    <section 
      className="bg-backgroundlight px-4 py-10 lg:hidden flex flex-col"
      aria-label="Mobile project showcase"
    >
      <div className="flex flex-col gap-4">
        {ITEMS.map((item, i) => (
          <article
            key={item.id}
            className="rounded-xl bg-neutral-200 p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold whitespace-pre-line leading-[0.9]">
                {item.title}
              </h3>
              <span className="text-sm font-medium opacity-70" aria-label={`Project ${i + 1}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="text-base opacity-80">{item.desc}</p>
            <button 
              className="mt-2 self-start text-sm font-semibold hover:opacity-70 transition-opacity"
              onClick={() => handleProjectClick(i)}
              aria-label={`View details for ${item.title.replace('\n', ' ')}`}
            >
              [SEE MORE]
            </button>
          </article>
        ))}
      </div>

      <button 
        className="font-semibold pt-5 text-center hover:opacity-70 transition-opacity"
        aria-label="View all projects"
      >
        SEE MORE
      </button>
    </section>
  );
}

/**
 * Custom hook for managing scroll-based card animations
 */
function useScrollAnimation(itemCount) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sectionHeight, setSectionHeight] = useState("100vh");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const cardRefs = useRef([]);

  const vhRef = useRef(0);
  const sectionTopRef = useRef(0);
  const rafRef = useRef(0);
  const lastScrollYRef = useRef(0);

  const listTargetYRef = useRef(0);
  const listCurrentYRef = useRef(0);

  // Use regular arrays instead of Float32Arrays
  const animationStateRef = useRef({
    targetY: Array(itemCount).fill(0),
    targetScale: Array(itemCount).fill(1),
    targetRotate: Array(itemCount).fill(0),
    currentY: Array(itemCount).fill(0),
    currentScale: Array(itemCount).fill(1),
    currentRotate: Array(itemCount).fill(0),
  });

  const activeIndexRef = useRef(0);

  const checkReducedMotion = useCallback(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    return !!mq?.matches;
  }, []);

  const reducedMotionRef = useRef(false);

  const measure = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const vh = window.innerHeight;
    if (!vh || vh <= 0) return;

    vhRef.current = vh;

    const totalPx = Math.max((itemCount + 1) * vh, vh * 2);
    const nextHeight = `${totalPx}px`;

    setSectionHeight((prev) => (prev === nextHeight ? prev : nextHeight));

    const rect = section.getBoundingClientRect();
    sectionTopRef.current = rect.top + window.scrollY;
  }, [itemCount]);

  const computeTargets = useCallback(() => {
    const state = animationStateRef.current;
    const vh = vhRef.current;
    if (!vh || vh <= 0) return;

    const sectionTop = sectionTopRef.current;
    const scrollY = window.scrollY;
    const direction = scrollY >= lastScrollYRef.current ? 1 : -1;

    const trackLen = itemCount * vh;
    const raw = scrollY - sectionTop;

    const progressed = clamp(raw - vh * CONFIG.ANIM_DELAY, 0, trackLen);
    const sinceStart = progressed + vh;

    listTargetYRef.current = -progressed;

    let bestIndex = -1;

    for (let i = 0; i < itemCount; i++) {
      const progress = (sinceStart - i * vh) / vh;

      // Y position
      state.targetY[i] = (1 - progress) * vh;

      const cardHeight = CONFIG.CARD_HEIGHT_VH * vh;
      const cardHalf = cardHeight * 0.5;
      const wrapperTop = listTargetYRef.current + i * vh;
      const cardCenterY = wrapperTop + 0.5 * vh + state.targetY[i];
      const cardTopY = cardCenterY - cardHalf;

      // Scale
      const scaleProgress = clamp((vh - cardTopY) / vh, 0, 1);
      state.targetScale[i] = 1 - (1 - CONFIG.MIN_SCALE) * scaleProgress;

      const scaledCardHeight = cardHeight * state.targetScale[i];
      const scaledCardHalf = scaledCardHeight * 0.5;
      const scaledTopY = cardCenterY - scaledCardHalf;
      const scaledBottomY = cardCenterY + scaledCardHalf;
      const visiblePx = Math.max(0, Math.min(scaledBottomY, vh) - Math.max(scaledTopY, 0));
      const visibleRatio = scaledCardHeight > 0 ? visiblePx / scaledCardHeight : 0;

      // Rotation
      if (i === 0) {
        state.targetRotate[i] = 0;
      } else {
        const cardBottomY = cardCenterY + cardHalf;
        const untiltStartY = vh;
        const untiltEndY = 0.6 * vh + cardHalf;

        if (cardBottomY >= untiltStartY) {
          state.targetRotate[i] = CONFIG.MAX_ROTATE;
        } else if (cardBottomY <= untiltEndY) {
          state.targetRotate[i] = 0;
        } else {
          const t = (untiltStartY - cardBottomY) / (untiltStartY - untiltEndY);
          state.targetRotate[i] = CONFIG.MAX_ROTATE * (1 - t);
        }
      }

      // Active index detection
      if (visibleRatio >= CONFIG.ACTIVE_VISIBILITY_THRESHOLD) {
        if (direction >= 0) {
          bestIndex = i;
        } else if (bestIndex === -1) {
          bestIndex = i;
        }
      }
    }

    if (bestIndex !== -1 && activeIndexRef.current !== bestIndex) {
      activeIndexRef.current = bestIndex;
      startTransition(() => {
        setActiveIndex(bestIndex);
      });
    }

    lastScrollYRef.current = scrollY;
  }, [itemCount, startTransition]);

  const renderFrame = useCallback(() => {
    const list = listRef.current;
    const state = animationStateRef.current;
    if (!list) return false;

    const reduced = reducedMotionRef.current;
    let needsNextFrame = false;

    // Animate list position
    if (reduced) {
      listCurrentYRef.current = listTargetYRef.current;
    } else {
      const target = listTargetYRef.current;
      const current = listCurrentYRef.current;
      const delta = target - current;

      if (Math.abs(delta) > CONFIG.LIST_EPS) {
        listCurrentYRef.current = current + delta * CONFIG.LIST_SMOOTH;
        needsNextFrame = true;
      } else {
        listCurrentYRef.current = target;
      }
    }

    // Update list transform using CSS custom property
    list.style.setProperty('--list-y', `${listCurrentYRef.current}px`);

    // Animate each card
    for (let i = 0; i < itemCount; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      if (reduced) {
        state.currentY[i] = state.targetY[i];
        state.currentScale[i] = state.targetScale[i];
        state.currentRotate[i] = state.targetRotate[i];
      } else {
        const dyDelta = state.targetY[i] - state.currentY[i];
        const dsDelta = state.targetScale[i] - state.currentScale[i];
        const drDelta = state.targetRotate[i] - state.currentRotate[i];

        if (
          Math.abs(dyDelta) > CONFIG.EPS ||
          Math.abs(dsDelta) > CONFIG.EPS ||
          Math.abs(drDelta) > CONFIG.EPS
        ) {
          state.currentY[i] += dyDelta * CONFIG.SMOOTH;
          state.currentScale[i] += dsDelta * CONFIG.SMOOTH;
          state.currentRotate[i] += drDelta * CONFIG.SMOOTH;
          needsNextFrame = true;
        } else {
          state.currentY[i] = state.targetY[i];
          state.currentScale[i] = state.targetScale[i];
          state.currentRotate[i] = state.targetRotate[i];
        }
      }

      // Update using CSS custom properties
      el.style.setProperty('--card-y', `${state.currentY[i]}px`);
      el.style.setProperty('--card-scale', state.currentScale[i]);
      el.style.setProperty('--card-rotate', `${state.currentRotate[i]}deg`);
      el.style.zIndex = i === activeIndexRef.current ? 50 : itemCount - i;
    }

    return needsNextFrame;
  }, [itemCount]);

  const tick = useCallback(function runTick() {
    rafRef.current = 0;
    const needsNextFrame = renderFrame();

    if (needsNextFrame) {
      rafRef.current = requestAnimationFrame(runTick);
    }
  }, [renderFrame]);

  const requestTick = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // Initialize
  useLayoutEffect(() => {
    reducedMotionRef.current = checkReducedMotion();
    measure();
    computeTargets();

    // Set initial values
    const state = animationStateRef.current;
    for (let i = 0; i < itemCount; i++) {
      state.currentY[i] = state.targetY[i];
      state.currentScale[i] = state.targetScale[i];
      state.currentRotate[i] = state.targetRotate[i];
    }
    listCurrentYRef.current = listTargetYRef.current;

    renderFrame();
    setIsInitialized(true);
    requestTick();
  }, [checkReducedMotion, measure, computeTargets, renderFrame, requestTick, itemCount]);

  // Event listeners
  useEffect(() => {
    const onScroll = () => {
      computeTargets();
      requestTick();
    };

    const onResize = () => {
      reducedMotionRef.current = checkReducedMotion();
      measure();
      computeTargets();
      requestTick();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Handle reduced motion preference changes
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const mqHandler = () => {
      reducedMotionRef.current = checkReducedMotion();
      onResize();
    };

    if (mq?.addEventListener) {
      mq.addEventListener("change", mqHandler);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      if (mq?.removeEventListener) {
        mq.removeEventListener("change", mqHandler);
      }
    };
  }, [checkReducedMotion, measure, computeTargets, requestTick]);

  return {
    sectionRef,
    listRef,
    cardRefs,
    activeIndex,
    sectionHeight,
    isInitialized,
    isPending,
  };
}

/**
 * Desktop scroll-based showcase with 3D card effects
 */
function DesktopWorkShowcase() {
  const {
    sectionRef,
    listRef,
    cardRefs,
    activeIndex,
    sectionHeight,
    isInitialized,
  } = useScrollAnimation(ITEMS.length);

  return (
    <section
      ref={sectionRef}
      className="bg-backgroundlight hidden lg:block pt-24"
      style={{ height: sectionHeight }}
      aria-label="Desktop project showcase"
      role="region"
    >
      <div className="sticky top-0 h-screen flex px-4">
        <span className="text-sm md:text-xl font-medium absolute top-5 right-5 z-10">
          [2026 SHOWCASE]
        </span>

        <div
          className="w-1/3 flex flex-col justify-end pb-16 overflow-hidden"
          style={{
            opacity: isInitialized ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        >
          <div key={activeIndex}>
            <MaskedLines
              as="h2"
              className="text-[140px] font-bold tracking-[-0.04em]"
              text={ITEMS[activeIndex].title}
            />
            <div className="mt-3 max-w-md">
              <MaskedLines text={ITEMS[activeIndex].desc} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="w-2/3 relative">
          <div className="relative h-full">
            <div
              ref={listRef}
              className="will-change-transform"
              style={{ 
                transform: 'translate3d(0, var(--list-y, 0), 0)',
                '--list-y': '0px'
              }}
            >
              {ITEMS.map((item, i) => (
                <div
                  key={item.id}
                  className="h-screen grid place-items-center"
                  style={{
                    perspective: "1200px",
                    perspectiveOrigin: "center center",
                  }}
                >
                  <div
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="m-auto h-[50vh] w-[80%] rounded-xl bg-neutral-200 flex items-center justify-center text-2xl font-medium"
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center bottom',
                      willChange: 'transform',
                      backfaceVisibility: 'visible',
                      transform: 'translate3d(0, var(--card-y, 0), 0) scale(var(--card-scale, 1)) rotateX(var(--card-rotate, 0deg))',
                      '--card-y': '0px',
                      '--card-scale': 1,
                      '--card-rotate': '0deg',
                    }}
                    role="article"
                    aria-label={`Project: ${item.title.replace('\n', ' ')}`}
                  >
                    {item.title.replace("\n", " ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
