"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// deterministic rng (kept)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Testimony() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  // Reference copy style: big editorial line, medium weight
  const text = "So, ready to animate?";
  const chars = useMemo(() => Array.from(text), [text]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const TOPBAR_H = 91; // reference topbar height

    const ctx = gsap.context(() => {
      const els = Array.from(track.querySelectorAll("[data-char]"));
      if (!els.length) return;

      const measure = () => {
        // mimic “grid-margin: 25px” + fixed topbar
        const viewportW = section.clientWidth;
        const contentW = track.scrollWidth;

        const startX = viewportW; // off-screen right
        const endX = -contentW; // off-screen left
        const dist = Math.abs(endX - startX);

        // distance-aware pin length (snappy but not too long)
        const scrollLen = Math.max(1100, dist * 0.72);

        return { startX, endX, scrollLen };
      };

      gsap.set(track, { x: measure().startX, willChange: "transform" });
      gsap.set(els, {
        y: 0,
        rotate: 0,
        scale: 1,
        transformOrigin: "50% 85%",
        willChange: "transform",
        force3D: true,
      });

      // per-letter params (deterministic)
      const rnd = mulberry32(text.length * 99173);
      const params = els.map((el) => {
        const isSpace = el.getAttribute("data-space") === "1";
        const damp = isSpace ? 0.1 : 1;

        return {
          isSpace,
          // slightly tighter/cleaner to match the reference’s “designed” feel
          yAmp: (10 + rnd() * 16) * damp,
          rAmp: (0.5 + rnd() * 1.4) * damp,
          sAmp: (0.008 + rnd() * 0.018) * damp,
          f1: 0.9 + rnd() * 1.1,
          f2: 1.8 + rnd() * 1.7,
          p1: rnd() * Math.PI * 2,
          p2: rnd() * Math.PI * 2,
          accent: !isSpace && rnd() > 0.9 ? 1.22 : 1,
        };
      });

      const setY = els.map((el) => gsap.quickSetter(el, "y", "px"));
      const setR = els.map((el) => gsap.quickSetter(el, "rotate", "deg"));
      const setS = els.map((el) => gsap.quickSetter(el, "scale"));

      const applyLetters = (progress, velocity) => {
        const cycles = 10.5; // “wiggles” across pin
        const baseT = progress * cycles * Math.PI * 2;

        // reference easing vibe: punchy but controlled
        const v = Math.abs(velocity || 0);
        const boost = 1 + Math.min(1, v / 2400) * 0.85;

        for (let i = 0; i < els.length; i++) {
          const p = params[i];
          if (p.isSpace) continue;

          const n =
            Math.sin(baseT * p.f1 + p.p1) * 0.64 +
            Math.sin(baseT * p.f2 + p.p2) * 0.36;

          const y = n * p.yAmp * boost * p.accent;
          const r =
            Math.sin(baseT * (p.f1 * 0.92) + p.p1 + Math.PI / 3) *
            p.rAmp *
            boost *
            p.accent;
          const s =
            1 +
            Math.sin(baseT * (p.f2 * 0.86) + p.p2 + Math.PI / 2) *
              p.sAmp *
              boost;

          setY[i](y);
          setR[i](r);
          setS[i](s);
        }
      };

      // update letters only when scroll changes
      let lastScroll = ScrollTrigger.scroll();

      const tween = gsap.to(track, {
        x: () => measure().endX,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          // account for fixed 91px topbar like the reference
          start: () => `top top+=${TOPBAR_H}`,
          end: () => `+=${measure().scrollLen}`,
          pin: true,
          pinSpacing: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,

          onUpdate: (self) => {
            const s = self.scroll();
            if (s === lastScroll) return;
            lastScroll = s;
            applyLetters(self.progress, self.getVelocity());
          },

          onLeave: () => applyLetters(1, 0),
          onLeaveBack: () => applyLetters(0, 0),
        },
      });

      const onRefreshInit = () => {
        const { startX } = measure();
        gsap.set(track, { x: startX });
        gsap.set(els, { y: 0, rotate: 0, scale: 1 });
        lastScroll = ScrollTrigger.scroll();
      };

      ScrollTrigger.addEventListener("refreshInit", onRefreshInit);

      // ensure correct on resize / font load
      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
        tween.kill();
      };
    }, sectionRef);

    return () => ctx.revert();
  }, [text]);

  // Reference tokens
  const TOKENS = {
    yellow: "#C9FE6E",
    black: "#121212",
    white: "#F1F1F1",
    darkGrey: "#232323",
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
      style={{
        background: TOKENS.yellow, // bg-primary
        color: TOKENS.black, // text-muted
        fontFamily:
          'LayGrotesk, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      {/* Topbar (fixed, 91px, z≈7) */}
      <header
        className="fixed inset-x-0 top-0 z-[7] border-b"
        style={{
          height: 91,
          borderColor: "rgba(18,18,18,0.18)",
          background: TOKENS.yellow,
        }}
      >
        <div
          className="h-full"
          style={{ paddingLeft: 25, paddingRight: 25 }}
        >
          <div className="h-full flex items-center justify-between gap-6">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div
                className="h-[28px] w-[28px] rounded-[2px]"
                style={{ background: TOKENS.black }}
                aria-hidden="true"
              />
              <span className="text-[13px] font-medium tracking-tight">
                Made With Motion
              </span>
            </div>

            {/* Nav (13px / 500, like reference UI nav) */}
            <nav className="hidden md:flex items-center gap-3">
              {["Showcase", "Learn", "Submit"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-[13px] font-medium px-4 h-[41px] inline-flex items-center rounded-[2px]"
                  style={{
                    transition:
                      "transform 0.2s cubic-bezier(0.9,0,0.1,1), background-color 0.2s cubic-bezier(0.9,0,0.1,1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(18,18,18,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Actions (41px height, radius 2px, 13px) */}
            <div className="flex items-center gap-3">
              <button
                className="h-[41px] min-w-[86px] rounded-[2px] text-[13px] font-medium px-4 inline-flex items-center justify-center"
                style={{
                  background: TOKENS.white,
                  color: TOKENS.black,
                  transition:
                    "transform 0.2s cubic-bezier(0.9,0,0.1,1), background-color 0.2s cubic-bezier(0.9,0,0.1,1)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
              >
                Explore
              </button>
              <button
                className="h-[41px] min-w-[195px] rounded-[2px] text-[13px] font-medium px-4 inline-flex items-center justify-center"
                style={{
                  background: TOKENS.black,
                  color: TOKENS.white,
                  transition:
                    "transform 0.2s cubic-bezier(0.9,0,0.1,1), background-color 0.2s cubic-bezier(0.9,0,0.1,1)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
              >
                Submit an Effect
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main (pinned area). Leave room for fixed topbar */}
      <div className="relative" style={{ paddingTop: 91 }}>
        {/* subtle “grid margin” feel */}
        <div style={{ paddingLeft: 25, paddingRight: 25 }}>
          {/* Kicker in mono like reference secondary font */}
          <div
            className="pt-[50px] md:pt-[80px]"
            style={{
              fontFamily:
                'IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          >
            <p className="text-[12px] md:text-[13px] font-medium leading-[40px]">
              SCROLL TO SCRUB • CUBIC-BEZIER(0.9,0,0.1,1)
            </p>
          </div>
        </div>

        {/* Centered track */}
        <div className="absolute inset-0 flex items-center">
          <div
            ref={trackRef}
            className="whitespace-nowrap font-medium tracking-tight"
            style={{
              // reference: huge type + tight line height
              fontSize: "clamp(64px, 10vw, 160px)",
              lineHeight: 0.9,
              willChange: "transform",
              paddingLeft: 25,
              paddingRight: 25,
            }}
            aria-label={text}
          >
            {chars.map((ch, idx) => {
              const isSpace = ch === " ";
              return (
                <span
                  key={`${idx}-${ch}`}
                  data-char
                  data-space={isSpace ? "1" : "0"}
                  style={{
                    display: "inline-block",
                    whiteSpace: isSpace ? "pre" : "normal",
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer hint (dark band like reference footer) */}
      <div
        className="absolute bottom-0 inset-x-0"
        style={{
          height: 120,
          background: TOKENS.black,
        }}
        aria-hidden="true"
      />
    </section>
  );
}