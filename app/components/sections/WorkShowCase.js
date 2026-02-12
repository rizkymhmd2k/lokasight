"use client";

import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const ITEMS = [
  { title: "GARIS KARSA", desc: "Description for project one" },
  { title: "BLACK ROCK INC", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

const MaskedLines = memo(function MaskedLines({ text, as: Tag = "div", className = "" }) {
  const lines = useMemo(() => String(text).split("\n"), [text]);

  return (
    <Tag className={`flex flex-col justify-center ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden leading-tight">
          <span className="block animate-line will-change-transform" style={{ animationDelay: `${i * 70}ms` }}>
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
      <div className="flex items-center justify-between mb-6">
        <span className="font-semibold">2026 SHOWCASE</span>
        <span className="text-sm font-medium opacity-70">[WORK]</span>
      </div>

      <div className="flex flex-col gap-4">
        {ITEMS.map((item, i) => (
          <article key={i} className="rounded-xl bg-neutral-200 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
              <span className="text-sm font-medium opacity-70">{String(i + 1).padStart(2, "0")}</span>
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

function DesktopWorkShowcase() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const cardsRef = useRef([]);

  const vhRef = useRef(0);
  const sectionTopRef = useRef(0);

  const rafScrollRef = useRef(0);
  const rafAnimRef = useRef(0);

  const targetRef = useRef([]);
  const currentRef = useRef([]);

  const admireRef = useRef({ frozen: false, baseRaw: 0 });
  const prevRawRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const [sectionHeight, setSectionHeight] = useState("2000px");

  const DEBUG = false;
  const [debug, setDebug] = useState({
    y: 0,
    sectionTop: 0,
    raw: 0,
    progressed: 0,
    trackLen: 0,
    sinceStart: 0,
  });

  const EFFECT_STOP = 0.9;
  const MAX_SCALE = 0.18;
  const MAX_ROTATE = 16;
  const SMOOTH = 0.08;
  const EPS = 0.001;

  const ANIM_DELAY = 0.12;

  const POST_SCALE_RANGE = 0.35;
  const MIN_SCALE = 0.92;

  const FOCUS = 0.8;
  const SWITCH_MARGIN = 0.16;

  const ADMIRE_VH = 0.25;

  const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

  const ensureBuffers = useCallback(() => {
    const n = ITEMS.length;

    if (targetRef.current.length !== n) {
      targetRef.current = Array.from({ length: n }, () => ({ y: 0, scale: 1, rotate: 0 }));
    }
    if (currentRef.current.length !== n) {
      currentRef.current = Array.from({ length: n }, () => ({ y: 0, scale: 1, rotate: 0 }));
    }
    if (cardsRef.current.length !== n) {
      cardsRef.current.length = n;
    }
  }, []);

  const animate = useCallback(() => {
    let keepGoing = false;

    const cards = cardsRef.current;
    const targets = targetRef.current;
    const currents = currentRef.current;

    for (let i = 0; i < targets.length; i++) {
      const card = cards[i];
      if (!card) continue;

      const t = targets[i];
      const c = currents[i];

      c.y += (t.y - c.y) * SMOOTH;
      c.scale += (t.scale - c.scale) * SMOOTH;
      c.rotate += (t.rotate - c.rotate) * SMOOTH;

      card.style.transform = `translate3d(0, ${c.y}px, 0) scale(${c.scale}) rotateX(${c.rotate}deg)`;

      const z = i === activeIndexRef.current ? 50 : ITEMS.length - i;
      card.style.zIndex = String(z);

      if (
        Math.abs(t.y - c.y) > EPS ||
        Math.abs(t.scale - c.scale) > EPS ||
        Math.abs(t.rotate - c.rotate) > EPS
      ) {
        keepGoing = true;
      }
    }

    if (keepGoing) {
      rafAnimRef.current = requestAnimationFrame(animate);
    } else {
      rafAnimRef.current = 0;
    }
  }, [SMOOTH, EPS]);

  const measure = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const vh = window.innerHeight || 1;
    vhRef.current = vh;

    const totalPx = Math.max((ITEMS.length + 1) * vh, vh * 2);
    const nextHeight = `${totalPx}px`;

    setSectionHeight((prev) => (prev === nextHeight ? prev : nextHeight));

    const rect = section.getBoundingClientRect();
    sectionTopRef.current = rect.top + window.scrollY;
  }, []);

  const applyTransforms = useCallback(() => {
    ensureBuffers();

    const vh = vhRef.current || window.innerHeight || 1;
    const sectionTop = sectionTopRef.current;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    const trackLen = ITEMS.length * vh;
    const raw = scrollY - sectionTop;

    const prevRaw = prevRawRef.current;
    prevRawRef.current = raw;

    const justEnteredFromAbove = prevRaw !== null && prevRaw < 0 && raw >= 0;
    if (justEnteredFromAbove) {
      admireRef.current.frozen = true;
      admireRef.current.baseRaw = raw;
    }

    if (raw >= 0 && admireRef.current.frozen) {
      const admirePx = vh * ADMIRE_VH;
      const consumed = raw - admireRef.current.baseRaw;
      if (consumed < admirePx) return;
      admireRef.current.frozen = false;
    }

    if (raw < 0) {
      admireRef.current.frozen = false;
      admireRef.current.baseRaw = 0;
    }

    const delayPx = vh * ANIM_DELAY;
    const progressed = clamp(raw - delayPx, 0, trackLen);
    const sinceStart = progressed + vh;

    let bestIndex = 0;
    let bestDist = Infinity;

    const targets = targetRef.current;

    for (let i = 0; i < ITEMS.length; i++) {
      const progress = (sinceStart - i * vh) / vh;
      const y = (1 - progress) * vh;

      let scale = 1;
      let rotate = 0;

      if (progress < EFFECT_STOP) {
        const norm = 1 - progress / EFFECT_STOP;
        scale = 1 + MAX_SCALE * norm;
        rotate = MAX_ROTATE * norm;
      } else {
        const t = clamp((progress - EFFECT_STOP) / POST_SCALE_RANGE, 0, 1);
        scale = 1 - (1 - MIN_SCALE) * t;
        rotate = 0;
      }

      const tgt = targets[i];
      tgt.y = y;
      tgt.scale = scale;
      tgt.rotate = rotate;

      const dist = Math.abs(progress - FOCUS);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }

    const prevIdx = activeIndexRef.current;
    if (prevIdx !== bestIndex) {
      const prevProgress = (sinceStart - prevIdx * vh) / vh;
      const prevDist = Math.abs(prevProgress - FOCUS);
      const improvedBy = prevDist - bestDist;

      if (improvedBy > SWITCH_MARGIN) {
        activeIndexRef.current = bestIndex;
        setActiveIndex(bestIndex);
      }
    }

    if (!rafAnimRef.current) rafAnimRef.current = requestAnimationFrame(animate);

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
    ensureBuffers,
    ANIM_DELAY,
    ADMIRE_VH,
    EFFECT_STOP,
    MAX_SCALE,
    MAX_ROTATE,
    POST_SCALE_RANGE,
    MIN_SCALE,
    FOCUS,
    SWITCH_MARGIN,
    DEBUG,
    animate,
  ]);

  useLayoutEffect(() => {
    ensureBuffers();
    measure();
  }, [ensureBuffers, measure]);

  useEffect(() => {
    const tick = () => {
      rafScrollRef.current = 0;
      applyTransforms();
    };

    const onScroll = () => {
      if (rafScrollRef.current) return;
      rafScrollRef.current = requestAnimationFrame(tick);
    };

    const onResize = () => {
      measure();
      applyTransforms();
    };

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (rafScrollRef.current) return;
            rafScrollRef.current = requestAnimationFrame(() => {
              rafScrollRef.current = 0;
              measure();
              applyTransforms();
            });
          })
        : null;

    measure();
    applyTransforms();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);

    if (sectionRef.current && ro) ro.observe(sectionRef.current);

    if (document.fonts?.ready) {
      document.fonts.ready.then(onResize).catch(() => {});
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      if (ro) ro.disconnect();

      if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
      rafScrollRef.current = 0;

      if (rafAnimRef.current) cancelAnimationFrame(rafAnimRef.current);
      rafAnimRef.current = 0;

      admireRef.current.frozen = false;
      admireRef.current.baseRaw = 0;
      prevRawRef.current = null;
    };
  }, [measure, applyTransforms]);

  return (
    <section ref={sectionRef} className="bg-backgroundlight hidden lg:block pt-25" style={{ height: sectionHeight }}>
      <div className="sticky top-0 h-screen flex px-4 overflow-hidden">
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

        {/* LEFT — keep remount to replay ALL text animations */}
        <div key={activeIndex} className="w-2/5 flex flex-col justify-center pr-12">
          <span className="absolute bottom-5 text-xl font-medium mr-50 flex gap-1">
            <span>[WORK / </span>
            <MaskedLines as="span" className="text-xl" text={String(activeIndex + 1).padStart(2, "0")} />
            <span>]</span>
          </span>

          <MaskedLines as="h2" className="text-8xl font-bold tracking-[-0.04em]" text={ITEMS[activeIndex].title} />
          <div className="mt-3 max-w-md">
            <MaskedLines text={ITEMS[activeIndex].desc} className="text-2xl" />
          </div>
        </div>

        {/* RIGHT — stage + GRID STACK (no absolute cards) */}
        <div className="w-3/5 relative overflow-hidden">
          <span className="absolute top-5 right-0 text-xl font-semibold">[2026 SHOWCASE]</span>
          <span className="absolute bottom-5 right-0 text-xl font-medium z-50">[SEE MORE]</span>

          <div ref={stageRef} className="relative h-full grid place-items-center" style={{ perspective: 500 }}>
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
                className="col-start-1 row-start-1 m-auto h-[50vh] w-[70%] rounded-xl bg-neutral-200 flex items-center justify-center text-2xl font-medium will-change-transform"
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