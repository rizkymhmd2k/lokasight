"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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
        <span className="font-semibold">2026 SHOWCASE</span>
        <span className="text-sm font-medium opacity-70">[WORK]</span>
      </div>

      <div className="flex flex-col gap-4">
        {ITEMS.map((item, i) => (
          <article key={i} className="rounded-xl bg-neutral-200 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
              <span className="text-sm font-medium opacity-70">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <p className="text-base opacity-80">{item.desc}</p>

            <button className="mt-2 self-start text-sm font-semibold">[SEE MORE]</button>
          </article>
        ))}
      </div>

      <span className="font-semibold pt-5 text-center">SEE MORE</span>
    </section>
  );
}

/* ---------------------------------------------
   Desktop Work Showcase
   - Starts animation exactly when the sticky hits top (sectionTop)
   - Works when refreshing anywhere (re-measures on resize/fonts/RO)
   - Preserves your original 3D curve: tilt -> untilt -> scaledown
   - Smooth/glide: cards ease toward targets via rAF loop
   - FIX: admire delay only arms when entering from above (raw crosses <0 -> >=0)
---------------------------------------------- */
function DesktopWorkShowcase() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const cardsRef = useRef([]);

  // geometry cache
  const vhRef = useRef(0);
  const sectionTopRef = useRef(0);

  // rAF lock
  const rafRef = useRef(0);
  const animRef = useRef(0);
  const targetRef = useRef([]);
  const currentRef = useRef([]);

  // admire delay lock (vh-based)
  const admireRef = useRef({
    frozen: false,
    baseRaw: 0,
  });

  // FIX: track previous raw so we only arm admire when entering from above
  const prevRawRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [sectionHeight, setSectionHeight] = useState("500vh");

  // Toggle this if you want your debug HUD
  const DEBUG = false;
  const [debug, setDebug] = useState({
    y: 0,
    sectionTop: 0,
    raw: 0,
    progressed: 0,
    trackLen: 0,
    sinceStart: 0,
  });

  // --- motion tuning (same spirit as your original) ---
  const EFFECT_STOP = 0.9;
  const MAX_SCALE = 0.18;
  const MAX_ROTATE = 16;
  const SMOOTH = 0.08; // smaller = floatier (more lag)
  const EPS = 0.001;

  // delay after sticky engages (in vh units)
  const ANIM_DELAY = 0.12;

  // post-stop shrink
  const POST_SCALE_RANGE = 0.35;
  const MIN_SCALE = 0.92;

  // active selection
  const FOCUS = 0.8;
  const SWITCH_MARGIN = 0.16;

  // admire distance in vh (scroll-controlled pause)
  const ADMIRE_VH = 0.25; // 0.12 subtle, 0.18 nice, 0.25 strong

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const animate = useCallback(() => {
    let keepGoing = false;

    for (let i = 0; i < ITEMS.length; i++) {
      const card = cardsRef.current[i];
      const target = targetRef.current[i];
      if (!card || !target) continue;

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
    }

    if (keepGoing) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      animRef.current = 0;
    }
  }, [SMOOTH, EPS]);

  const measure = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const vh = window.innerHeight || 1;
    vhRef.current = vh;

    // Sticky duration: enough to run through all cards,
    // plus one extra screen so the last card can fully leave the viewport before unstick.
    const total = (ITEMS.length + 1) * vh;
    setSectionHeight(`${Math.max(total, vh * 2)}px`);

    const rect = section.getBoundingClientRect();
    sectionTopRef.current = rect.top + window.scrollY;
  }, []);

  const applyTransforms = useCallback(() => {
    const vh = vhRef.current || window.innerHeight || 1;
    const sectionTop = sectionTopRef.current;

    const scrollY = window.scrollY || window.pageYOffset || 0;

    const trackLen = ITEMS.length * vh; // same as your original
    const raw = scrollY - sectionTop; // 0 exactly when sticky hits top

    // -------------------------
    // FIX: vh-based admire gate
    // Arm ONLY when entering from above (raw crosses <0 -> >=0).
    // This prevents "stuck frozen" behavior when entering from below.
    // -------------------------
    const prevRaw = prevRawRef.current;
    prevRawRef.current = raw;

    const justEnteredFromAbove = prevRaw !== null && prevRaw < 0 && raw >= 0;

    if (justEnteredFromAbove) {
      admireRef.current.frozen = true;
      admireRef.current.baseRaw = raw; // typically ~0
    }

    if (raw >= 0 && admireRef.current.frozen) {
      const admirePx = vh * ADMIRE_VH;
      const consumed = raw - admireRef.current.baseRaw;

      if (consumed < admirePx) {
        // keep targets as-is; no new target updates, no animation start
        return;
      }

      // once consumed enough, stop freezing
      admireRef.current.frozen = false;
    }

    if (raw < 0) {
      // reset if user scrolls back above the section
      admireRef.current.frozen = false;
      admireRef.current.baseRaw = 0;
    }

    // delay (same intention as your original ANIM_DELAY)
    const delayPx = vh * ANIM_DELAY;
    const progressed = clamp(raw - delayPx, 0, trackLen);

    // restore your original "sinceStart = delayed + vh"
    const sinceStart = progressed + vh;

    let bestIndex = 0;
    let bestDist = Infinity;

    for (let i = 0; i < ITEMS.length; i++) {
      const card = cardsRef.current[i];
      if (!card) continue;

      // original progress & y mapping
      const progress = (sinceStart - i * vh) / vh;
      const y = (1 - progress) * vh;

      let scale = 1;
      let rotate = 0;

      // original curve: tilt -> untilt -> scaledown
      if (progress < EFFECT_STOP) {
        const norm = 1 - progress / EFFECT_STOP; // 1 -> 0
        scale = 1 + MAX_SCALE * norm;
        rotate = MAX_ROTATE * norm;
      } else {
        const t = clamp((progress - EFFECT_STOP) / POST_SCALE_RANGE, 0, 1);
        scale = 1 - (1 - MIN_SCALE) * t;
        rotate = 0;
      }

      targetRef.current[i] = { y, scale, rotate };

      // pick active card (same as your original idea)
      const dist = Math.abs(progress - FOCUS);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }

    setActiveIndex((prev) => {
      if (prev === bestIndex) return prev;

      const prevProgress = (sinceStart - prev * vh) / vh;
      const prevDist = Math.abs(prevProgress - FOCUS);

      const improvedBy = prevDist - bestDist;
      if (improvedBy > SWITCH_MARGIN) return bestIndex;

      return prev;
    });

    if (!animRef.current) {
      animRef.current = requestAnimationFrame(animate);
    }

    if (DEBUG) {
      setDebug({
        y: scrollY,
        sectionTop,
        raw,
        progressed,
        trackLen,
        sinceStart,
      });
    }
  }, [
    ANIM_DELAY,
    EFFECT_STOP,
    MAX_SCALE,
    MAX_ROTATE,
    SMOOTH,
    EPS,
    POST_SCALE_RANGE,
    MIN_SCALE,
    FOCUS,
    SWITCH_MARGIN,
    DEBUG,
    animate,
    ADMIRE_VH,
  ]);

  // Measure before paint to avoid jump
  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const tick = () => {
      rafRef.current = 0;
      applyTransforms();
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(tick);
    };

    const onResize = () => {
      measure();
      applyTransforms();
    };

    // ResizeObserver: handles layout shifts (fonts, images, etc)
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(() => {
              rafRef.current = 0;
              measure();
              applyTransforms();
            });
          })
        : null;

    // initial
    measure();
    applyTransforms();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);

    if (sectionRef.current && ro) ro.observe(sectionRef.current);

    // Re-measure once fonts settle (fixes refresh mid-page drift)
    if (document.fonts?.ready) {
      document.fonts.ready.then(onResize).catch(() => {});
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      if (ro) ro.disconnect();

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;

      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = 0;

      admireRef.current.frozen = false;
      admireRef.current.baseRaw = 0;
      prevRawRef.current = null;
    };
  }, [measure, applyTransforms]);

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
        {DEBUG && (
          <div className="fixed top-4 right-4 z-[9999] rounded-xl bg-black/80 px-3 py-2 text-xs font-mono text-white backdrop-blur">
            <div>y: {Math.round(debug.y)}</div>
            <div>sectionTop: {Math.round(debug.sectionTop)}</div>
            <div>raw: {Math.round(debug.raw)}</div>
            <div>progressed: {Math.round(debug.progressed)}</div>
            <div>trackLen: {Math.round(debug.trackLen)}</div>
            <div>sinceStart: {Math.round(debug.sinceStart)}</div>
          </div>
        )}

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
          <span className="absolute bottom-5 right-0 text-xl font-medium z-50">[SEE MORE]</span>

          <div className="relative h-full" style={{ perspective: 500 }}>
            {ITEMS.map((item, i) => (
              <div
                key={i}
                ref={(el) => {
                  cardsRef.current[i] = el;
                  if (el) {
                    el.style.transformStyle = "preserve-3d";
                    el.style.transformOrigin = "center bottom";
                  }
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
