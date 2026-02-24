"use client";

import { useEffect, useRef, useState } from "react";

const HEADLINE_LINES = ["READY TO BUILD", "SOMETHING", "RISKY?"];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function RevealLine({ text, progress, xShift }) {
  const hiddenBottom = 100 - progress * 100;

  return (
    <span
      className="relative block leading-[0.82] tracking-[-0.06em]"
      style={{ transform: `translateX(${xShift}px)` }}
    >
      <span
        className="block text-transparent"
        style={{ WebkitTextStroke: "1.5px rgba(15, 15, 15, 0.74)" }}
      >
        {text}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 text-neutral-950"
        style={{ clipPath: `inset(0 0 ${hiddenBottom}% 0)` }}
      >
        {text}
      </span>
    </span>
  );
}

export default function Footer1() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let rafId = 0;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const start = viewportHeight * 0.9;
      const end = -rect.height * 0.22;
      const nextProgress = clamp((start - rect.top) / (start - end), 0, 1);

      setProgress(nextProgress);
      rafId = 0;
    };

    const requestUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const bgParallaxY = (1 - progress) * 80;
  const textRotation = -7 + progress * 4;
  const textScale = 0.97 + progress * 0.03;
  const wowProgress = clamp((progress - 0.78) / 0.22, 0, 1);
  const wowLift = 28 - wowProgress * 28;
  const wowScale = 0.93 + wowProgress * 0.07;
  const wowGlow = 0.24 + wowProgress * 0.76;

  return (
    <footer
      id="footer"
      ref={sectionRef}
      className="relative overflow-hidden rounded-t-4xl bg-backgroundlight px-4 pt-16 pb-8 md:pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          transform: `translateY(${bgParallaxY}px)`,
          background:
            "radial-gradient(170% 120% at 50% 110%, rgba(206,216,54,0.92) 0%, #e8ed9a 28%, #f6f5df 56%, #f8f7f3 76%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/8 to-transparent"
      />

      <div className="relative z-10 min-h-[96vh] md:min-h-[102vh]">
        <div className="absolute left-4 top-2 sm:left-6">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-700">
            FINAL CALL
          </p>
        </div>
        <div className="absolute right-4 top-2 text-right sm:right-6">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-700">
            DESIGN + DEV
          </p>
        </div>

        <div className="flex h-full flex-col items-center justify-center">
          <h2
            aria-label="READY TO BUILD SOMETHING RISKY?"
            className="font-oswald text-[19.5vw] uppercase md:text-[15vw] lg:text-[12.4vw]"
            style={{ transform: `rotate(${textRotation}deg) scale(${textScale})` }}
          >
            {HEADLINE_LINES.map((line, index) => (
              <RevealLine
                key={line}
                text={line}
                progress={clamp(progress - index * 0.1, 0, 1)}
                xShift={index === 0 ? -12 : index === 1 ? 56 : -78}
              />
            ))}
          </h2>

          <div
            className="absolute left-1/2 top-[71%] w-full max-w-sm -translate-x-1/2 px-2 md:max-w-md"
            style={{
              opacity: wowProgress,
              transform: `translate(-50%, ${wowLift}px) scale(${wowScale})`,
              transition: "opacity 360ms ease, transform 360ms ease",
            }}
          >
            <div className="relative rounded-[1.8rem] border border-white/35 bg-black/92 p-5 text-backgroundlight backdrop-blur-sm md:p-6">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-[2rem] blur-2xl"
                style={{
                  opacity: wowGlow,
                  background:
                    "radial-gradient(95% 90% at 50% 50%, rgba(214,225,75,0.95) 0%, rgba(240,196,85,0.75) 42%, rgba(16,16,16,0.05) 100%)",
                }}
              />

              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/75">
                  Start a project
                </p>
                <p className="mt-2 text-lg font-bold leading-tight tracking-[-0.03em] md:text-2xl">
                  Let&apos;s make your next launch impossible to ignore
                </p>

                <a
                  href="mailto:hello@studio.com"
                  className="relative mt-5 inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-black transition-transform duration-300 hover:-translate-y-0.5"
                  style={{
                    background:
                      "linear-gradient(102deg, #d4df4d 0%, #f3df73 49%, #c7e84a 100%)",
                    boxShadow: `0 0 0 1px rgba(255,255,255,0.26), 0 14px 40px rgba(208,223,82,${wowGlow})`,
                  }}
                >
                  Launch Project
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 border-t border-black/15 pt-4 text-xs font-medium tracking-[0.06em] text-neutral-700 md:flex md:items-center md:justify-between">
        <p>UTC+7 • JAKARTA</p>
        <p>Replies in less than 24 hours</p>
        <p>© 2026 Creative Studio</p>
      </div>
    </footer>
  );
}
