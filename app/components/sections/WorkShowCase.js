"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ITEMS = [
  { title: "GARIS\nKARSA", desc: "Description for project one" },
  { title: "BLACK\nROCK", desc: "Description for project two" },
  { title: "Project\nThree", desc: "Description for project three" },
  { title: "Project\nFour", desc: "Description for project four" },
];

const CFG = {
  EFFECT_STOP: 0.9, // When to stop the laying down effect
  MAX_SCALE: 0.45, // Initial scale (cards start 45% larger)
  MAX_ROTATE: 45, // Initial tilt angle (laying down at 45deg)
  SMOOTH: 0.08,
  EPS: 0.001,
  ANIM_DELAY: 0.12,
  POST_SCALE_RANGE: 0.4, // Range for scaling down after standing
  MIN_SCALE: 0.85, // Final scale when card is settled (85% of original)
  FOCUS: 0.8, // Which card position is "active"
  LIST_SMOOTH: 0.085,
  LIST_EPS: 0.15,
  RESPECT_REDUCED_MOTION: true,
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

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
  return (
    <section className="bg-backgroundlight px-4 py-10 lg:hidden flex flex-col">
      <div className="flex flex-col gap-4">
        {ITEMS.map((item, i) => (
          <article
            key={i}
            className="rounded-xl bg-neutral-200 p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold whitespace-pre-line leading-[0.9]">
                {item.title}
              </h3>
              <span className="text-sm font-medium opacity-70">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="text-base opacity-80">{item.desc}</p>
            <button className="mt-2 self-start text-sm font-semibold">
              [SEE MORE]
            </button>
          </article>
        ))}
      </div>

      <span className="font-semibold pt-5 text-center">SEE MORE</span>
    </section>
  );
}

/**
 * Fixed bugs:
 * 1. Proper cleanup of event listeners and RAF
 * 2. Fixed initial render state (buffers initialized correctly)
 * 3. Fixed reduced motion event listener cleanup
 * 4. Improved scroll calculation edge cases
 * 5. Better defensive checks to prevent NaN/undefined values
 * 6. Fixed z-index stacking context issues
 * 7. Proper initial state setting to prevent flash
 */
function DesktopWorkShowcase() {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const frameRef = useRef([]);
  
  // Layout measurements
  const vhRef = useRef(0);
  const sectionTopRef = useRef(0);

  // Animation state
  const rafRef = useRef(0);
  const reducedMotionRef = useRef(false);

  // List scrub state
  const listTargetYRef = useRef(0);
  const listCurrentYRef = useRef(0);

  // Per-card animation buffers
  const bufRef = useRef(null);

  // React state
  const [sectionHeight, setSectionHeight] = useState("100vh");
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize animation buffers
  const ensureBuffers = useCallback(() => {
    const n = ITEMS.length;
    if (bufRef.current?.n === n) return bufRef.current;

    const newBuf = {
      n,
      ty: new Float32Array(n),
      ts: new Float32Array(n).fill(1),
      tr: new Float32Array(n),
      cy: new Float32Array(n),
      cs: new Float32Array(n).fill(1),
      cr: new Float32Array(n),
    };
    
    bufRef.current = newBuf;
    return newBuf;
  }, []);

  // Check for reduced motion preference
  const checkReducedMotion = useCallback(() => {
    if (!CFG.RESPECT_REDUCED_MOTION) return false;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    return !!mq?.matches;
  }, []);

  // Measure section and viewport dimensions
  const measure = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const vh = window.innerHeight;
    if (!vh || vh <= 0) return;

    vhRef.current = vh;

    // Calculate total scroll height
    const totalPx = Math.max((ITEMS.length + 1) * vh, vh * 2);
    const nextHeight = `${totalPx}px`;
    
    setSectionHeight((prev) => (prev === nextHeight ? prev : nextHeight));

    // Get section position
    const rect = section.getBoundingClientRect();
    sectionTopRef.current = rect.top + window.scrollY;
  }, []);

  // Calculate target positions for all cards
  const computeTargets = useCallback(() => {
    const b = ensureBuffers();
    if (!b) return;

    const vh = vhRef.current;
    if (!vh || vh <= 0) return;

    const sectionTop = sectionTopRef.current;
    const scrollY = window.scrollY;

    const trackLen = ITEMS.length * vh;
    const raw = scrollY - sectionTop;

    // Calculate scroll progress
    const progressed = clamp(raw - vh * CFG.ANIM_DELAY, 0, trackLen);
    const sinceStart = progressed + vh;

    // Update list target position
    listTargetYRef.current = -progressed;

    let bestIndex = 0;
    let bestDist = Infinity;

    const { ty, ts, tr } = b;

    // Calculate targets for each card
    for (let i = 0; i < b.n; i++) {
      const progress = (sinceStart - i * vh) / vh;

      // Y position (from bottom to top)
      ty[i] = (1 - progress) * vh;

      // Card 1 (i=0): stays as original behavior
      // Cards 2+ (i>=1): start fully tilted at bottom, untilt to 0 by center
      
      if (i === 0) {
        // First card: original behavior (starts at center, straight)
        if (progress < 0.5) {
          ts[i] = 1;
          tr[i] = 0;
        } else {
          const exitProgress = clamp((progress - 0.5) / 0.5, 0, 1);
          ts[i] = 1 - (1 - CFG.MIN_SCALE) * exitProgress;
          tr[i] = 0;
        }
      } else {
        // Cards 2+: enter tilted from bottom, untilt as they approach center
        if (progress <= 0) {
          // Below viewport: fully tilted and large
          ts[i] = 1 + CFG.MAX_SCALE;
          tr[i] = CFG.MAX_ROTATE;
        } else if (progress <= 0.5) {
          // From bottom to center: untilt from MAX_ROTATE to 0
          // Untilting completes 100% when card reaches center (progress = 0.5)
          const untiltProgress = progress / 0.5; // 0 at bottom, 1 at center
          ts[i] = 1 + CFG.MAX_SCALE * (1 - untiltProgress);
          tr[i] = CFG.MAX_ROTATE * (1 - untiltProgress);
        } else {
          // After center: fully straight, scale down
          const exitProgress = clamp((progress - 0.5) / 0.5, 0, 1);
          ts[i] = 1 - (1 - CFG.MIN_SCALE) * exitProgress;
          tr[i] = 0;
        }
      }

      // Find active card (closest to center = progress 0.5)
      const dist = Math.abs(progress - 0.5);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }

    // Update active index
    if (activeIndexRef.current !== bestIndex) {
      activeIndexRef.current = bestIndex;
      setActiveIndex(bestIndex);
    }
  }, [ensureBuffers]);

  // Render animation frame
  const renderFrame = useCallback(() => {
    const list = listRef.current;
    const b = bufRef.current;
    if (!list || !b) return false;

    const reduced = reducedMotionRef.current;
    let needsNextFrame = false;

    // Animate list position
    if (reduced) {
      listCurrentYRef.current = listTargetYRef.current;
    } else {
      const target = listTargetYRef.current;
      const current = listCurrentYRef.current;
      const delta = target - current;
      
      if (Math.abs(delta) > CFG.LIST_EPS) {
        listCurrentYRef.current = current + delta * CFG.LIST_SMOOTH;
        needsNextFrame = true;
      } else {
        listCurrentYRef.current = target;
      }
    }

    // Apply list transform
    const listY = listCurrentYRef.current;
    list.style.transform = `translate3d(0, ${listY}px, 0)`;

    // Animate individual cards
    const { ty, ts, tr, cy, cs, cr } = b;

    for (let i = 0; i < b.n; i++) {
      const el = frameRef.current[i];
      if (!el) continue;

      // Smooth interpolation or instant (reduced motion)
      if (reduced) {
        cy[i] = ty[i];
        cs[i] = ts[i];
        cr[i] = tr[i];
      } else {
        const dyDelta = ty[i] - cy[i];
        const dsDelta = ts[i] - cs[i];
        const drDelta = tr[i] - cr[i];

        if (
          Math.abs(dyDelta) > CFG.EPS ||
          Math.abs(dsDelta) > CFG.EPS ||
          Math.abs(drDelta) > CFG.EPS
        ) {
          cy[i] += dyDelta * CFG.SMOOTH;
          cs[i] += dsDelta * CFG.SMOOTH;
          cr[i] += drDelta * CFG.SMOOTH;
          needsNextFrame = true;
        } else {
          cy[i] = ty[i];
          cs[i] = ts[i];
          cr[i] = tr[i];
        }
      }

      // Apply transforms
      el.style.transform = `translate3d(0, ${cy[i]}px, 0) scale(${cs[i]}) rotateX(${cr[i]}deg)`;
      el.style.zIndex = i === activeIndexRef.current ? 50 : b.n - i;
    }

    return needsNextFrame;
  }, []);

  // Animation loop
  const tick = useCallback(() => {
    rafRef.current = 0;

    const needsNextFrame = renderFrame();
    
    if (needsNextFrame) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [renderFrame]);

  // Request animation frame
  const requestTick = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // Initial setup
  useLayoutEffect(() => {
    ensureBuffers();
    reducedMotionRef.current = checkReducedMotion();
    measure();
    computeTargets();
    
    // Initialize current values to targets for first render
    const b = bufRef.current;
    if (b) {
      for (let i = 0; i < b.n; i++) {
        b.cy[i] = b.ty[i];
        b.cs[i] = b.ts[i];
        b.cr[i] = b.tr[i];
      }
      listCurrentYRef.current = listTargetYRef.current;
    }
    
    renderFrame();
    setIsInitialized(true);
    requestTick();
  }, [ensureBuffers, checkReducedMotion, measure, computeTargets, renderFrame, requestTick]);

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

    // Watch for reduced motion changes
    let mq = null;
    let mqHandler = null;
    
    if (CFG.RESPECT_REDUCED_MOTION && window.matchMedia) {
      mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mqHandler = () => {
        reducedMotionRef.current = checkReducedMotion();
        onResize();
      };
      
      // Use modern API if available, fallback to deprecated
      if (mq.addEventListener) {
        mq.addEventListener("change", mqHandler);
      } else if (mq.addListener) {
        mq.addListener(mqHandler);
      }
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      if (mq && mqHandler) {
        if (mq.removeEventListener) {
          mq.removeEventListener("change", mqHandler);
        } else if (mq.removeListener) {
          mq.removeListener(mqHandler);
        }
      }
    };
  }, [checkReducedMotion, measure, computeTargets, requestTick]);

  return (
    <section
      ref={sectionRef}
      className="bg-backgroundlight hidden lg:block pt-25"
      style={{ height: sectionHeight }}
    >
      <div className="sticky top-0 h-screen flex px-4 overflow-hidden">
        <span className="text-sm md:text-xl font-medium absolute top-5 right-5 z-10">
          [2026 SHOWCASE]
        </span>

        {/* Left Panel */}
        <div
          className="w-1/3 flex flex-col justify-end pb-15"
          style={{ opacity: isInitialized ? 1 : 0, transition: 'opacity 0.3s' }}
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

        {/* Right Panel - Cards */}
        <div className="w-2/3 relative">
          <div
            className="relative h-full overflow-hidden"
            style={{ perspective: "1200px" }}
          >
            <div
              ref={listRef}
              className="will-change-transform"
              style={{ transform: "translate3d(0, 0, 0)" }}
            >
              {ITEMS.map((item, i) => (
                <div key={i} className="h-screen grid place-items-center">
                  <div
                    ref={(el) => {
                      if (el && !frameRef.current[i]) {
                        frameRef.current[i] = el;
                        el.style.transformStyle = "preserve-3d";
                        el.style.transformOrigin = "center bottom";
                        el.style.willChange = "transform";
                      }
                    }}
                    className="m-auto h-[50vh] w-[80%] rounded-xl bg-neutral-200 flex items-center justify-center text-2xl font-medium"
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