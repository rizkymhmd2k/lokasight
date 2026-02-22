"use client";

import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

  useLayoutEffect(() => {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) return;

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

    // reset and measure
    lastLinesRef.current = null;
    schedule();

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
  }, [wrapperRef, measureRef, words]);

  return lines;
}

const Work = () => {
  const wrapperRef = useRef(null);
  const measureRef = useRef(null);
  const linesRootRef = useRef(null);

  const bodyText =
    "I help service and software businesses create memorable, optimised website experiences as quickly as they need create memorable, optimised website experiences as quickly as they need.";

  const words = useMemo(() => bodyText.trim().split(/\s+/), [bodyText]);
  const workHeadingClassName =
    "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.08]";

  const lines = useMeasuredLines({ wrapperRef, measureRef, words });

  // Animate with GSAP + ScrollTrigger (no IO, no visible state, no per-line inline transitions)
  useLayoutEffect(() => {
    if (!lines || !wrapperRef.current || !linesRootRef.current) return;

    const ctx = gsap.context(() => {
      const targets = linesRootRef.current.querySelectorAll("[data-line]");

      // Set initial state once (no React-driven animation)
      gsap.set(targets, { y: 34, autoAlpha: 0 });

      gsap.to(targets, {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.16,
        overwrite: true,
        onStart: () => {
          gsap.set(targets, { willChange: "transform,opacity" });
        },
        onComplete: () => {
          // Release will-change after animation to reduce memory/compositing cost
          gsap.set(targets, { clearProps: "willChange" });
        },
        onReverseComplete: () => {
          gsap.set(targets, { clearProps: "willChange" });
        },
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
          // markers: true,
        },
      });
    }, wrapperRef);

    // Ensure ScrollTrigger recalculates after lines change
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [lines]);

  return (
    <div id="work" className="pt-12 md:pt-24 bg-backgroundlight px-4 flex flex-col">
      <div ref={wrapperRef} style={{ position: "relative" }}>
        {/* Measurement: spans exist from first render; no DOM mutation; hidden after measured */}
        <h1
          ref={measureRef}
          aria-hidden={lines !== null ? "true" : undefined}
          className={workHeadingClassName}
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
            className={workHeadingClassName}
          >
            {lines.map((line, i) => (
              <span key={i} data-line style={{ display: "block" }}>
                {i === 0 && (
                  <span className="text-sm md:text-xl font-medium mr-5 md:mr-48">
                    [WORK]
                  </span>
                )}
                {line}
              </span>
            ))}
          </h1>
        )}
      </div>
    </div>
  );
};

export default Work;
