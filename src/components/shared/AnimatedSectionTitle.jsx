"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const screens = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const breakpoint = (name) => {
  const min = screens[name];
  const next = Object.values(screens).find((value) => value > min);

  if (name === "base") return `(max-width: ${screens.sm - 1}px)`;
  if (!next) return `(min-width: ${min}px)`;

  return `(min-width: ${min}px) and (max-width: ${next - 1}px)`;
};

const titleBreakpoints = [
  [breakpoint("base"), "top 84%"],
  [breakpoint("sm"), "top 76%"],
  [breakpoint("md"), "top 75%"],
  [breakpoint("lg"), "top 75%"],
  [breakpoint("xl"), "top 76%"],
  [breakpoint("2xl"), "top 64%"],
];

export default function AnimatedSectionTitle({ text, color = "white" }) {
  const titleRef = useRef(null);

  /* Keep nowrap title inside available width at every viewport. */
  useLayoutEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    const fitTitle = () => {
      title.style.fontSize = "";

      const textWidth = [...title.children].reduce((width, letter) => {
        const styles = getComputedStyle(letter);
        const margin =
          parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
        return width + letter.getBoundingClientRect().width + margin;
      }, 0);
      const availableWidth = title.clientWidth;

      if (textWidth > 0 && availableWidth > 0) {
        const fontSize = parseFloat(getComputedStyle(title).fontSize);
        title.style.fontSize = `${(fontSize * availableWidth) / textWidth}px`;
      }
    };

    const observer = new ResizeObserver(fitTitle);
    observer.observe(title.parentElement);
    fitTitle();

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) fitTitle();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [text]);

  /* ---------------------------------
   * Title letter animation
   * --------------------------------- */
  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    const letters = title.querySelectorAll("[data-title-letter]");
    if (!letters.length) return;

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(letters, { yPercent: 0, clearProps: "transform" });
        return;
      }

      gsap.set(letters, { yPercent: 120 });

      const mm = gsap.matchMedia();
      const makeTimeline = (startValue) => {
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: {
              trigger: title,
              start: startValue,
              invalidateOnRefresh: true,
              toggleActions: "restart none none reverse",
            },
          })
          .fromTo(
            letters,
            { yPercent: 120 },
            { yPercent: 0, duration: 0.65, stagger: 0.1 },
          );
      };

      titleBreakpoints.forEach(([query, start]) => {
        mm.add(query, () => makeTimeline(start));
      });

      ScrollTrigger.refresh();
      return () => mm.revert();
    }, title);

    return () => ctx.revert();
  }, [text]);

  return (
    <h2
      ref={titleRef}
      style={{
        transform: "translateX(-0.7vw) scaleY(1.18)",
        transformOrigin: "center",
        color,
      }}
      className="mx-auto min-w-0 w-full max-w-full overflow-visible whitespace-nowrap text-center font-anton font-normal leading-none tracking-[-0.035em] text-[19vw] md:text-[22.1vw]"
      aria-label={text}
    >
      {[...text].map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="inline-block overflow-hidden align-top px-[0.02em] pt-[0.1em] pb-[0.08em] -mx-[0.01em] -mt-[0.1em]"
        >
          <span data-title-letter className="inline-block">
            {char === " " ? "\u00a0" : char}
          </span>
        </span>
      ))}
    </h2>
  );
}
