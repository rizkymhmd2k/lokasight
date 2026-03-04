"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Behance", href: "#" },
  { label: "Dribbble", href: "#" },
  { label: "LinkedIn", href: "#" },
];

const FOOTER_HEADING = "Ready To Take Risk ?";

const TOP_COLUMNS = [
  {
    title: "Navigation",
    align: "lg:text-left lg:justify-self-start",
    items: [
      { label: "Home", href: "#home" },
      { label: "Work", href: "#work" },
      { label: "Services", href: "#services" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Services",
    align: "lg:text-left lg:justify-self-center",
    items: [
      { label: "Brand Websites", href: "#services" },
      { label: "Web Development", href: "#services" },
      { label: "Creative Direction", href: "#services" },
    ],
  },
  {
    title: "Contact",
    align: "lg:text-right lg:justify-self-end",
    items: [
      { label: "hello@formrizk.com", href: "mailto:hello@formrizk.com" },
      { label: "Jakarta, Indonesia", href: "#" },
      { label: "Replies in 24h", href: "#" },
    ],
  },
];

// Shared by every letter — same speed, same easing character
// expo.out gives a strong initial push that decelerates beautifully
const SPAN = 0.60;
const EASE = gsap.parseEase("expo.out");

export default function Footer2() {
  const footerRef  = useRef(null);
  const headingRef = useRef(null);
  const debugRef   = useRef(null);

  useLayoutEffect(() => {
    const footer  = footerRef.current;
    const heading = headingRef.current;
    if (!footer || !heading) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const letters = heading.querySelectorAll("[data-footer-letter]");
      if (!letters.length) return;

      if (prefersReducedMotion) {
        gsap.set(letters, { yPercent: 0, clearProps: "transform" });
        return;
      }

      gsap.set(letters, { yPercent: 0 });

      // Only start offset is random — span + ease are identical per letter
      const meta = Array.from(letters).map(() => ({
        start: gsap.utils.random(0.0, 1 - SPAN),
      }));

      const setY = Array.from(letters).map((el) =>
        gsap.quickSetter(el, "yPercent")
      );

      const makeTrigger = (startValue) => {
        const st = ScrollTrigger.create({
          trigger: footer,
          start: startValue,
          end: "max",
          // High scrub = heavy inertia — letters keep gliding after you stop scrolling
          // 80 seconds of lag means a very pronounced coast-to-rest feel
          scrub: 80,
          markers: true,
          invalidateOnRefresh: true,
          onUpdate({ progress: p }) {
            if (debugRef.current) {
              debugRef.current.textContent = `footer anim ${Math.round(p * 100)}%`;
            }
            letters.forEach((_, i) => {
              const local = gsap.utils.clamp(0, 1, (p - meta[i].start) / SPAN);
              setY[i](EASE(local) * 100);
            });
          },
          onLeave()     { letters.forEach((_, i) => setY[i](100)); },
          onLeaveBack() { letters.forEach((_, i) => setY[i](0));   },
        });
        return () => st.kill();
      };

      const mm = gsap.matchMedia();
      mm.add("(max-width: 639px)",                          () => makeTrigger("top 86%"));
      mm.add("(min-width: 640px) and (max-width: 767px)",   () => makeTrigger("top 84%"));
      mm.add("(min-width: 768px) and (max-width: 1023px)",  () => makeTrigger("top 82%"));
      mm.add("(min-width: 1024px) and (max-width: 1279px)", () => makeTrigger("top 76%"));
      mm.add("(min-width: 1280px) and (max-width: 1535px)", () => makeTrigger("top 72%"));
      mm.add("(min-width: 1536px)",                         () => makeTrigger("top 68%"));

      ScrollTrigger.refresh();
      return () => mm.revert();
    }, footer);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      id="footer-2"
      ref={footerRef}
      className="relative flex items-end overflow-hidden bg-backgroundlight px-4 sm:px-6 lg:px-8"
    >
      {process.env.NODE_ENV === "development" && (
        <div
          ref={debugRef}
          className="pointer-events-none absolute right-3 top-3 z-[9999] rounded-md bg-black/80 px-2 py-1 text-xs font-mono text-white"
        >
          footer anim 0%
        </div>
      )}

      <div aria-hidden className="footer2-bg pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex h-full w-full flex-col justify-between pt-8 lg:py-10">

        {/* MOBILE / TABLET */}
        <div className="lg:hidden flex flex-col h-full justify-between">
          <div className="max-w-[18rem] py-8 space-y-2">
            <p className="text-sm text-black/90 font-bold">Sitemap</p>
            <ul className="space-y-2 text-6xl font-semibold leading-[0.95] tracking-[-0.04em]">
              {TOP_COLUMNS[0].items.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="transition-opacity hover:opacity-70">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-7 py-8">
            {TOP_COLUMNS.slice(1).map(({ title, items }, i) => (
              <div key={title} className={`space-y-3 ${i === 1 ? "text-right" : ""}`}>
                <p className="text-sm text-black/90 font-bold">{title}</p>
                <ul className="space-y-1 text-base sm:text-2xl font-bold leading-[1.12] tracking-[-0.02em]">
                  {items.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="transition-opacity hover:opacity-70">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden py-10 lg:grid lg:grid-cols-3 text-lg font-bold tracking-[-0.01em] text-black">
          {TOP_COLUMNS.map(({ title, align, items }) => (
            <div key={title} className={align}>
              <p className="mb-3 text-lg uppercase tracking-[0.12em] text-black">{title}</p>
              <ul className="space-y-1 leading-[1.25]">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="transition-opacity hover:opacity-70">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          ref={headingRef}
          className="-mx-4 py-8 lg:py-10 w-[calc(100%+2rem)] -ml-[0.06em] text-[clamp(2rem,11.35vw,7.9rem)] lg:text-[clamp(3.5rem,10.8vw,235px)] font-bold leading-[0.9] tracking-[-0.06em] text-black"
          aria-label={FOOTER_HEADING}
          role="heading"
          aria-level={2}
        >
          <div className="overflow-hidden whitespace-nowrap">
            {FOOTER_HEADING.split("").map((char, index) => {
              if (char === " ") {
                return (
                  <span key={`space-${index}`} aria-hidden="true" className="inline-block w-[0.28em]" />
                );
              }
              return (
                <span
                  key={`char-${index}`}
                  aria-hidden="true"
                  data-footer-letter
                  className="relative inline-block will-change-transform"
                >
                  <span>{char}</span>
                  <span className="absolute bottom-full left-0" aria-hidden="true">{char}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Social + copyright */}
        <div className="pt-8 pb-4 flex flex-col gap-2 text-base sm:text-xl lg:text-[clamp(1.15rem,1.65vw,1.7rem)] font-semibold tracking-[-0.02em] text-black lg:flex-row lg:items-end lg:justify-between">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 lg:gap-x-8 lg:gap-y-2">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="transition-opacity hover:opacity-70">{label}</a>
              </li>
            ))}
          </ul>
          <p>© 2026 Formrizk Studio</p>
        </div>

      </div>
    </footer>
  );
}