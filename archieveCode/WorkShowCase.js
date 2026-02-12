"use client";

import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const ITEMS = [
  { title: "GARIS KARSA", desc: "Description for project one" },
  { title: "BLACK ROCK INC", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

const CFG = {
  EFFECT_STOP: 0.9,
  MAX_SCALE: 0.18,
  MAX_ROTATE: 16,
  SMOOTH: 0.08,
  EPS: 0.001,
  ANIM_DELAY: 0.12,
  POST_SCALE_RANGE: 0.35,
  MIN_SCALE: 0.92,
  FOCUS: 0.8,
  SWITCH_MARGIN: 0.16,
  ADMIRE_VH: 0.25,
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

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
  const cardsRef = useRef([]);

  const vhRef = useRef(0);
  const sectionTopRef = useRef(0);

  const rafScrollRef = useRef(0);
  const rafAnimRef = useRef(0);

  const admireRef = useRef({ frozen: false, baseRaw: 0 });
  const prevRawRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const [sectionHeight, setSectionHeight] = useState("2000px");

  // numeric buffers (faster + shorter)
  const bufRef = useRef(null);
  const ensureBuffers = useCallback(() => {
    const n = ITEMS.length;
    const b = bufRef.current;
    if (b?.n === n) return;

    bufRef.current = {
      n,
      ty: new Float32Array(n),
      ts: new Float32Array(n),
      tr: new Float32Array(n),
      cy: new Float32Array(n),
      cs: new Float32Array(n).fill(1),
      cr: new Float32Array(n),
    };
    cardsRef.current.length = n;
  }, []);

  const measure = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const vh = window.innerHeight || 1;
    vhRef.current = vh;

    const totalPx = Math.max((ITEMS.length + 1) * vh, vh * 2);
    const nextHeight = `${totalPx}px`;
    setSectionHeight((p) => (p === nextHeight ? p : nextHeight));

    const rect = section.getBoundingClientRect();
    sectionTopRef.current = rect.top + (window.scrollY || 0);
  }, []);

  const animate = useCallback(() => {
    const b = bufRef.current;
    if (!b) return;

    let keep = false;
    const { ty, ts, tr, cy, cs, cr } = b;
    const cards = cardsRef.current;

    for (let i = 0; i < b.n; i++) {
      const el = cards[i];
      if (!el) continue;

      cy[i] += (ty[i] - cy[i]) * CFG.SMOOTH;
      cs[i] += (ts[i] - cs[i]) * CFG.SMOOTH;
      cr[i] += (tr[i] - cr[i]) * CFG.SMOOTH;

      el.style.transform = `translate3d(0, ${cy[i]}px, 0) scale(${cs[i]}) rotateX(${cr[i]}deg)`;
      el.style.zIndex = String(i === activeIndexRef.current ? 50 : ITEMS.length - i);

      if (
        Math.abs(ty[i] - cy[i]) > CFG.EPS ||
        Math.abs(ts[i] - cs[i]) > CFG.EPS ||
        Math.abs(tr[i] - cr[i]) > CFG.EPS
      ) {
        keep = true;
      }
    }

    rafAnimRef.current = keep ? requestAnimationFrame(animate) : 0;
  }, []);

  const applyTransforms = useCallback(() => {
    ensureBuffers();
    const b = bufRef.current;
    if (!b) return;

    const vh = vhRef.current || window.innerHeight || 1;
    const sectionTop = sectionTopRef.current;
    const scrollY = window.scrollY || 0;

    const trackLen = ITEMS.length * vh;
    const raw = scrollY - sectionTop;

    const prevRaw = prevRawRef.current;
    prevRawRef.current = raw;

    // admire freeze when entering
    if (prevRaw !== null && prevRaw < 0 && raw >= 0) {
      admireRef.current.frozen = true;
      admireRef.current.baseRaw = raw;
    }
    if (raw >= 0 && admireRef.current.frozen) {
      const admirePx = vh * CFG.ADMIRE_VH;
      if (raw - admireRef.current.baseRaw < admirePx) return;
      admireRef.current.frozen = false;
    }
    if (raw < 0) {
      admireRef.current.frozen = false;
      admireRef.current.baseRaw = 0;
    }

    const progressed = clamp(raw - vh * CFG.ANIM_DELAY, 0, trackLen);
    const sinceStart = progressed + vh;

    let bestIndex = 0;
    let bestDist = Infinity;

    const { ty, ts, tr } = b;

    for (let i = 0; i < b.n; i++) {
      const progress = (sinceStart - i * vh) / vh;
      ty[i] = (1 - progress) * vh;

      if (progress < CFG.EFFECT_STOP) {
        const norm = 1 - progress / CFG.EFFECT_STOP;
        ts[i] = 1 + CFG.MAX_SCALE * norm;
        tr[i] = CFG.MAX_ROTATE * norm;
      } else {
        const t = clamp((progress - CFG.EFFECT_STOP) / CFG.POST_SCALE_RANGE, 0, 1);
        ts[i] = 1 - (1 - CFG.MIN_SCALE) * t;
        tr[i] = 0;
      }

      const dist = Math.abs(progress - CFG.FOCUS);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }

    const prevIdx = activeIndexRef.current;
    if (prevIdx !== bestIndex) {
      const prevProgress = (sinceStart - prevIdx * vh) / vh;
      const improvedBy = Math.abs(prevProgress - CFG.FOCUS) - bestDist;
      if (improvedBy > CFG.SWITCH_MARGIN) {
        activeIndexRef.current = bestIndex;
        setActiveIndex(bestIndex);
      }
    }

    if (!rafAnimRef.current) rafAnimRef.current = requestAnimationFrame(animate);
  }, [ensureBuffers, animate]);

  useLayoutEffect(() => {
    ensureBuffers();
    measure();
  }, [ensureBuffers, measure]);

  useEffect(() => {
    const schedule = (fn) => {
      if (rafScrollRef.current) return;
      rafScrollRef.current = requestAnimationFrame(() => {
        rafScrollRef.current = 0;
        fn();
      });
    };

    const recalc = () => {
      measure();
      applyTransforms();
    };

    const onScroll = () => schedule(applyTransforms);
    const onResize = () => schedule(recalc);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => schedule(recalc))
        : null;

    recalc();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    if (sectionRef.current && ro) ro.observe(sectionRef.current);

    if (document.fonts?.ready) document.fonts.ready.then(onResize).catch(() => {});

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      ro?.disconnect();

      if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
      if (rafAnimRef.current) cancelAnimationFrame(rafAnimRef.current);
      rafScrollRef.current = 0;
      rafAnimRef.current = 0;

      admireRef.current.frozen = false;
      admireRef.current.baseRaw = 0;
      prevRawRef.current = null;
    };
  }, [measure, applyTransforms]);

  return (
    <section ref={sectionRef} className="bg-backgroundlight hidden lg:block pt-25" style={{ height: sectionHeight }}>
      <div className="sticky top-0 h-screen flex px-4 overflow-hidden">
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

        <div className="w-3/5 relative overflow-hidden">
          <span className="absolute top-5 right-0 text-xl font-semibold">[2026 SHOWCASE]</span>
          <span className="absolute bottom-5 right-0 text-xl font-medium z-50">[SEE MORE]</span>

          <div className="relative h-full grid place-items-center" style={{ perspective: 500 }}>
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