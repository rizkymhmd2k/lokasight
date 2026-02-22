'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function sameArray(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function useMeasuredLines({ wrapperRef, measureRef, words }) {
  const [lines, setLines] = useState(null);

  const rafRef = useRef(0);
  const lastLinesRef = useRef(null);

  const measure = () => {
    const el = measureRef.current;
    if (!el) return;

    const spans = el.querySelectorAll('span[data-w="1"]');
    if (!spans.length) return;

    const result = [];
    let current = [];
    let currentTop = null;

    // offsetTop is typically cheaper than getBoundingClientRect()
    for (let i = 0; i < spans.length; i++) {
      const s = spans[i];
      const top = s.offsetTop;

      if (currentTop === null) currentTop = top;

      if (top > currentTop) {
        result.push(current.join(" "));
        current = [];
        currentTop = top;
      }

      current.push(s.textContent);
    }

    if (current.length) result.push(current.join(" "));

    const filtered = result.filter(Boolean);

    if (!sameArray(lastLinesRef.current, filtered)) {
      lastLinesRef.current = filtered;
      setLines(filtered);
    }
  };

  const schedule = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(measure);
  };

  useLayoutEffect(() => {
    // reset and measure
    setLines(null);
    lastLinesRef.current = null;
    schedule();

    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) return;

    // Only re-measure when width changes (huge win on pages with height-only changes)
    let lastWidth = wrapperEl.clientWidth;

    const ro = new ResizeObserver(() => {
      const w = wrapperEl.clientWidth;
      if (w === lastWidth) return;
      lastWidth = w;

      setLines(null);
      lastLinesRef.current = null;
      schedule();
    });

    ro.observe(wrapperEl);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [wrapperRef, words]);

  return lines;
}

const Work = () => {
  const wrapperRef = useRef(null);
  const measureRef = useRef(null);
  const linesRootRef = useRef(null);

  const bodyText =
    "I help service and software businesses create memorable, optimised website experiences as quickly as they need create memorable, optimised website experiences as quickly as they need.";

  const words = useMemo(() => bodyText.trim().split(/\s+/), [bodyText]);

  const lines = useMeasuredLines({ wrapperRef, measureRef, words });

  // Animate with GSAP + ScrollTrigger (no IO, no visible state, no per-line inline transitions)
  useLayoutEffect(() => {
    if (!lines || !wrapperRef.current || !linesRootRef.current) return;

    const ctx = gsap.context(() => {
      const targets = linesRootRef.current.querySelectorAll("[data-line]");

      // Set initial state once (no React-driven animation)
      gsap.set(targets, { y: 52, autoAlpha: 0, willChange: "transform,opacity" });

      gsap.to(targets, {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.11,
        overwrite: true,
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top 80%",
          once: true,
          // markers: true,
        },
        onComplete: () => {
          // Release will-change after animation to reduce memory/compositing cost
          gsap.set(targets, { clearProps: "willChange" });
        },
      });
    }, wrapperRef);

    // Ensure ScrollTrigger recalculates after lines change
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [lines]);

  return (
    <div id="work" className="pt-24 bg-backgroundlight px-4 flex flex-col">
      <div ref={wrapperRef} style={{ position: "relative" }}>
        {/* Measurement: spans exist from first render; no DOM mutation; hidden after measured */}
        <h1
          ref={measureRef}
          aria-hidden={lines !== null ? "true" : undefined}
          className="text-2xl md:text-3xl lg:text-7xl font-medium"
          style={
            lines !== null
              ? {
                  position: "absolute",
                  visibility: "hidden",
                  pointerEvents: "none",
                  opacity: 0,
                  inset: 0,
                }
              : { opacity: 0 }
          }
        >
          {words.map((w, i) => (
            <React.Fragment key={i}>
              <span data-w="1">{w}</span>
              {i < words.length - 1 ? " " : null}
            </React.Fragment>
          ))}
        </h1>

        {/* Output: no inline per-line transition strings; GSAP controls animation */}
        {lines !== null && (
          <h1
            ref={linesRootRef}
            aria-label={`[WORK] ${bodyText}`}
            className="text-2xl md:text-3xl lg:text-7xl font-medium"
          >
            {lines.map((line, i) => (
              <span key={i} style={{ display: "block", overflow: "hidden" }}>
                <span data-line style={{ display: "block" }}>
                  {i === 0 && (
                    <span className="text-sm md:text-xl font-medium mr-5 md:mr-48">
                      [WORK]
                    </span>
                  )}
                  {line}
                </span>
              </span>
            ))}
          </h1>
        )}
      </div>
    </div>
  );
};

export default Work;