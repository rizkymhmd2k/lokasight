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
  EFFECT_STOP: 0.9,
  MAX_ROTATE: 45,
  SMOOTH: 0.08,
  EPS: 0.001,
  ANIM_DELAY: 0.12,
  POST_SCALE_RANGE: 0.4,
  MIN_SCALE: 0.85,
  FOCUS: 0.8,
  LIST_SMOOTH: 0.085,
  LIST_EPS: 0.15,
  RESPECT_REDUCED_MOTION: true,
  CARD_HEIGHT_VH: 0.5, // Card is 50vh tall
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
 * Behavior:
 * - Cards 2+ start tilted at 45deg when below viewport
 * - When card BOTTOM passes bottom viewport edge, start untilting
 * - At 40% to center (progress = 0.4), cards become fully straight (0deg)
 * - Card 1 always stays straight
 */
function DesktopWorkShowcase() {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const frameRef = useRef([]);

  const vhRef = useRef(0);
  const sectionTopRef = useRef(0);

  const rafRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const listTargetYRef = useRef(0);
  const listCurrentYRef = useRef(0);

  const bufRef = useRef(null);

  const [sectionHeight, setSectionHeight] = useState("100vh");
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);

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

  const checkReducedMotion = useCallback(() => {
    if (!CFG.RESPECT_REDUCED_MOTION) return false;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    return !!mq?.matches;
  }, []);

  const measure = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const vh = window.innerHeight;
    if (!vh || vh <= 0) return;

    vhRef.current = vh;

    const totalPx = Math.max((ITEMS.length + 1) * vh, vh * 2);
    const nextHeight = `${totalPx}px`;

    setSectionHeight((prev) => (prev === nextHeight ? prev : nextHeight));

    const rect = section.getBoundingClientRect();
    sectionTopRef.current = rect.top + window.scrollY;
  }, []);

  const computeTargets = useCallback(() => {
    const b = ensureBuffers();
    if (!b) return;

    const vh = vhRef.current;
    if (!vh || vh <= 0) return;

    const sectionTop = sectionTopRef.current;
    const scrollY = window.scrollY;

    const trackLen = ITEMS.length * vh;
    const raw = scrollY - sectionTop;

    const progressed = clamp(raw - vh * CFG.ANIM_DELAY, 0, trackLen);
    const sinceStart = progressed + vh;

    listTargetYRef.current = -progressed;
    const listY = listTargetYRef.current;

    let bestIndex = 0;
    let bestDist = Infinity;

    const { ty, ts, tr } = b;

    for (let i = 0; i < b.n; i++) {
      const progress = (sinceStart - i * vh) / vh;

      // Y position (from bottom to top)
      ty[i] = (1 - progress) * vh;

      const cardHeight = CFG.CARD_HEIGHT_VH * vh;
      const cardHalf = cardHeight * 0.5;
      const wrapperTop = listY + i * vh;
      const cardCenterY = wrapperTop + 0.5 * vh + ty[i];
      const cardTopY = cardCenterY - cardHalf;

      // Scale down once the card enters the viewport, then keep scaling down as it rises.
      const scaleProgress = clamp((vh - cardTopY) / vh, 0, 1);
      ts[i] = 1 - (1 - CFG.MIN_SCALE) * scaleProgress;

      // Rotation: start untilting when card bottom clears viewport bottom
      if (i === 0) {
        // Card 1: always straight
        tr[i] = 0;
      } else {
        // Cards 2+: start untilting after the card bottom crosses viewport bottom,
        // finish straight when the card center hits viewport center.
        const cardBottomY = cardCenterY + cardHalf;

        const untiltStartY = vh; // viewport bottom
        const untiltEndY = 0.6 * vh + cardHalf; // card center at viewport center

        if (cardBottomY >= untiltStartY) {
          tr[i] = CFG.MAX_ROTATE;
        } else if (cardBottomY <= untiltEndY) {
          tr[i] = 0;
        } else {
          const t = (untiltStartY - cardBottomY) / (untiltStartY - untiltEndY);
          tr[i] = CFG.MAX_ROTATE * (1 - t);
        }
      }

      // Find active card
      const dist = Math.abs(progress - 0.5);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }

    if (activeIndexRef.current !== bestIndex) {
      activeIndexRef.current = bestIndex;
      setActiveIndex(bestIndex);
    }
  }, [ensureBuffers]);

  const renderFrame = useCallback(() => {
    const list = listRef.current;
    const b = bufRef.current;
    if (!list || !b) return false;

    const reduced = reducedMotionRef.current;
    let needsNextFrame = false;

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

    const listY = listCurrentYRef.current;
    list.style.transform = `translate3d(0, ${listY}px, 0)`;

    const { ty, ts, tr, cy, cs, cr } = b;

    for (let i = 0; i < b.n; i++) {
      const el = frameRef.current[i];
      if (!el) continue;

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

      el.style.transform = `translate3d(0, ${cy[i]}px, 0) scale(${cs[i]}) rotateX(${cr[i]}deg)`;
      el.style.zIndex = i === activeIndexRef.current ? 50 : b.n - i;
    }

    return needsNextFrame;
  }, []);

  const tick = useCallback(() => {
    rafRef.current = 0;

    const needsNextFrame = renderFrame();

    if (needsNextFrame) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [renderFrame]);

  const requestTick = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useLayoutEffect(() => {
    ensureBuffers();
    reducedMotionRef.current = checkReducedMotion();
    measure();
    computeTargets();

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
  }, [
    ensureBuffers,
    checkReducedMotion,
    measure,
    computeTargets,
    renderFrame,
    requestTick,
  ]);

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

    let mq = null;
    let mqHandler = null;

    if (CFG.RESPECT_REDUCED_MOTION && window.matchMedia) {
      mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mqHandler = () => {
        reducedMotionRef.current = checkReducedMotion();
        onResize();
      };

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
      <div className="sticky top-0 h-screen flex px-4">
        <span className="text-sm md:text-xl font-medium absolute top-5 right-5 z-10">
          [2026 SHOWCASE]
        </span>

        <div
          className="w-1/3 flex flex-col justify-end pb-15 overflow-hidden"
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
              style={{ transform: "translate3d(0, 0, 0)" }}
            >
              {ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="h-screen grid place-items-center"
                  style={{
                    perspective: "1200px",
                    perspectiveOrigin: "center center",
                  }}
                >
                  <div
                    ref={(el) => {
                      if (el && !frameRef.current[i]) {
                        frameRef.current[i] = el;
                        el.style.transformStyle = "preserve-3d";
                        el.style.transformOrigin = "center bottom";
                        el.style.willChange = "transform";
                        el.style.backfaceVisibility = "visible";
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
