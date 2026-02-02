"use client";

import { useEffect, useMemo, useRef, useState, useCallback, useLayoutEffect } from "react";

const ITEMS = [
  { title: "GARIS KARSA", desc: "Description for project one" },
  { title: "BLACK ROCK INC", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

/* ---------------------------------------------
   Line Mask Component
---------------------------------------------- */
function MaskedLines({ text, as: Tag = "div", className = "" }) {
  const lines = useMemo(() => String(text).split("\n"), [text]);

  return (
    <Tag className={`flex flex-col justify-center ${className}`}>
      {lines.map((line, i) => (
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
   Mobile Work Showcase (Simple Column)
---------------------------------------------- */
function MobileWorkShowcase() {
  return (
    <section className="bg-backgroundlight px-4 py-10 lg:hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <span className="font-semibold ">2026 SHOWCASE</span>
        <span className="text-sm font-medium opacity-70">[WORK]</span>
      </div>

      <div className="flex flex-col gap-4">
        {ITEMS.map((item, i) => (
          <article
            key={i}
            className="rounded-xl bg-neutral-200 p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
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

/* ---------------------------------------------
   Desktop Work Showcase (Approach B: explicit track + geometry progress)
---------------------------------------------- */
function DesktopWorkShowcase() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const cardsRef = useRef([]);

  const sectionTopRef = useRef(0);
  const trackLenRef = useRef(0);
  const vhRef = useRef(0);
  const targetRef = useRef([]);
  const currentRef = useRef([]);
  const animRafRef = useRef(0);
  const scrollRafRef = useRef(0);
  const inViewRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [sectionHeight, setSectionHeight] = useState("500vh"); // will be measured

  // --- motion tuning ---
  const EFFECT_STOP = 0.9;       // where "pre" animation ends (scale hits 1)
  const MAX_SCALE = 0.6;       // pre-stop scale up amount
  const MAX_ROTATE = 50;       // pre-stop rotateX amount
  const SMOOTH = 0.16;         // lerp factor for internal smoothing
  const EPS = 0.001;           // stop threshold

  // post-stop: keep shrinking slightly after scale=1
  const POST_SCALE_RANGE = 0.35; // how long after stop we keep shrinking (progress units)
  const MIN_SCALE = 0.92;        // smallest scale reached in post zone

  const FOCUS = 0.8;
  const SWITCH_MARGIN = 0.16;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const getProgress = useCallback((scrollSinceStart, i, vh) => {
    return (scrollSinceStart - i * vh) / vh;
  }, []);

  const computeTargets = useCallback(
    (scrollSinceStart) => {
      const vh = vhRef.current || window.innerHeight;

      let bestIndex = 0;
      let bestDist = Infinity;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const progress = getProgress(scrollSinceStart, i, vh);
        const y = (1 - progress) * vh;

        let scale = 1;
        let rotate = 0;

        if (progress < EFFECT_STOP) {
          // pre-stop: big laid-down + scale up
          const norm = 1 - progress / EFFECT_STOP; // 1 -> 0
          scale = 1 + MAX_SCALE * norm;
          rotate = MAX_ROTATE * norm;
        } else {
          // post-stop: keep shrinking a bit after reaching scale=1
          const t = clamp((progress - EFFECT_STOP) / POST_SCALE_RANGE, 0, 1); // 0 -> 1
          scale = 1 - (1 - MIN_SCALE) * t; // 1 -> MIN_SCALE
          rotate = 0; // keep flat after stop (set to 4-8 if you want a resting tilt)
        }

        targetRef.current[i] = { y, scale, rotate };

        const dist = Math.abs(progress - FOCUS);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      });

      setActiveIndex((prev) => {
        if (prev === bestIndex) return prev;

        const prevProgress = getProgress(scrollSinceStart, prev, vh);
        const prevDist = Math.abs(prevProgress - FOCUS);

        const improvedBy = prevDist - bestDist;
        if (improvedBy > SWITCH_MARGIN) return bestIndex;

        return prev;
      });
    },
    [
      EFFECT_STOP,
      MAX_SCALE,
      MAX_ROTATE,
      POST_SCALE_RANGE,
      MIN_SCALE,
      FOCUS,
      SWITCH_MARGIN,
      getProgress,
    ],
  );

  const animate = useCallback(() => {
    let keepGoing = false;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const target = targetRef.current[i];
      if (!target) return;

      const current = currentRef.current[i] || {
        y: target.y,
        scale: target.scale,
        rotate: target.rotate,
      };

      const y = current.y + (target.y - current.y) * SMOOTH;
      const scale = current.scale + (target.scale - current.scale) * SMOOTH;
      const rotate = current.rotate + (target.rotate - current.rotate) * SMOOTH;

      currentRef.current[i] = { y, scale, rotate };
      card.style.transform = `translate3d(0, ${y}px, 0) scale(${scale}) rotateX(${rotate}deg)`;

      if (
        Math.abs(target.y - y) > EPS ||
        Math.abs(target.scale - scale) > EPS ||
        Math.abs(target.rotate - rotate) > EPS
      ) {
        keepGoing = true;
      }
    });

    if (keepGoing && inViewRef.current) {
      animRafRef.current = requestAnimationFrame(animate);
    } else {
      animRafRef.current = 0;
    }
  }, [SMOOTH, EPS]);

  const measure = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const vh = window.innerHeight;
    vhRef.current = vh;

    const trackLen = ITEMS.length * vh;
    trackLenRef.current = trackLen;

    setSectionHeight(`${(ITEMS.length + 1) * 100}vh`);

    const anchor = stickyRef.current || section;
    const rect = anchor.getBoundingClientRect();
    sectionTopRef.current = rect.top + window.scrollY;
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const updateFromScroll = () => {
      const vh = vhRef.current || window.innerHeight;
      const sectionTop = sectionTopRef.current;
      const trackLen = trackLenRef.current;

      const raw = (window.scrollY || window.pageYOffset) - sectionTop;
      const progress = clamp(raw, 0, trackLen);
      const sinceStart = progress + vh;

      if (raw < -vh * 1.5 || raw > trackLen + vh * 1.5) {
        scrollRafRef.current = 0;
        return;
      }

      computeTargets(sinceStart);
      if (!animRafRef.current && inViewRef.current) {
        animRafRef.current = requestAnimationFrame(animate);
      }

      scrollRafRef.current = 0;
    };

    const onScroll = () => {
      if (!inViewRef.current) return;
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(updateFromScroll);
    };

    const onResize = () => {
      measure();
      updateFromScroll();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) onScroll();
      },
      { rootMargin: "200px 0px 200px 0px", threshold: 0 }
    );

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            measure();
            onScroll();
          })
        : null;

    measure();
    updateFromScroll();

    const ioTarget = stickyRef.current || sectionRef.current;
    io.observe(ioTarget);
    if (ro) ro.observe(ioTarget);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      if (ro) ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      animRafRef.current = 0;
      scrollRafRef.current = 0;
    };
  }, [animate, computeTargets, measure]);

  return (
    <section
      ref={sectionRef}
      className="bg-backgroundlight hidden lg:block pt-25 border border-red-700"
      style={{ height: sectionHeight }}
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen flex px-4 overflow-hidden border border-blue-700"
      >
        {/* LEFT */}
        <div key={activeIndex} className="w-2/5 flex flex-col justify-center pr-12">
          <span className="absolute bottom-5 text-xl font-medium mr-50 flex gap-1">
            <span>[WORK / </span>
            <MaskedLines
              as="span"
              className="text-xl"
              text={String(activeIndex + 1).padStart(2, "0")}
            />
            <span>]</span>
          </span>

          <MaskedLines
            as="h2"
            className="text-8xl font-bold tracking-[-0.04em]"
            text={ITEMS[activeIndex].title}
          />
          <div className="mt-3 max-w-md">
            <MaskedLines text={ITEMS[activeIndex].desc} className="text-2xl" />
          </div>
        </div>

        {/* RIGHT — 3D CARDS */}
        <div className="w-3/5 relative overflow-hidden">
          <span className="absolute top-5 right-0 text-xl font-semibold">[2026 SHOWCASE]</span>
          <span className="absolute bottom-5 right-0 text-xl font-medium z-50">
            [SEE MORE]
          </span>

          <div className="relative h-full" style={{ perspective: 500 }}>
            {ITEMS.map((item, i) => (
              <div
                key={i}
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                className="absolute inset-0 m-auto h-[50vh] w-[70%] rounded-xl bg-neutral-200 flex items-center justify-center text-2xl font-medium will-change-transform"
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

export default function WorkShowcase() {
  return (
    <>
      <MobileWorkShowcase />
      <DesktopWorkShowcase />
    </>
  );
}
