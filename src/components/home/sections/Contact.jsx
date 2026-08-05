"use client";

import { useEffect, useRef } from "react";
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

export default function Contact() {
  const contactTitleRef = useRef(null);
  const formCardRef = useRef(null);
  const blackBottomRef = useRef(null);

  /* ---------------------------------
   * Static content and breakpoints
   * --------------------------------- */
  const contactWord = "CONTACT";

  const fields = [
    { label: "Tell us about your project", type: "textarea" },
    { label: "Your name", type: "input" },
    { label: "you@email.com", type: "input" },
    { label: "What are you building?", type: "input" },
  ];

  /* ---------------------------------
   * CONTACT title letter animation
   * --------------------------------- */
  useEffect(() => {
    const title = contactTitleRef.current;
    if (!title) return;

    const letters = title.querySelectorAll("[data-contact-letter]");
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
  }, []);

  /* ---------------------------------
   * Yellow form card scroll animation
   * --------------------------------- */
  useEffect(() => {
    const card = formCardRef.current;
    const blackBottom = blackBottomRef.current;
    if (!card || !blackBottom) return;

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const getRequiredShift = () => {
      const cardRect = card.getBoundingClientRect();
      const blackRect = blackBottom.getBoundingClientRect();
      return Math.max(cardRect.bottom - blackRect.bottom, 0);
    };

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // < lg: keep fixed scroll lift; transform handles static overlap.
      mm.add("(max-width: 1023px)", () => {
        gsap.fromTo(
          card,
          { top: "0px" },
          {
            top: "-4rem",
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 70%",
              end: "top 20%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      // >= lg: stop exactly when yellow bottom meets black bottom
      mm.add("(min-width: 1024px)", () => {
        gsap.fromTo(
          card,
          { y: 0 },
          {
            y: () => -getRequiredShift(),
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 70%",
              end: "top 0%",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      ScrollTrigger.refresh();
      return () => mm.revert();
    }, card);

    return () => ctx.revert();
  }, []);

  return (
    <div
      id="contact"
      className="relative z-30 isolate w-full overflow-x-clip px-4 py-12 md:py-24 flex flex-col bg-backgroundlight"
    >
      <div className="relative w-full rounded-t-3xl overflow-visible">
        {/* Top black title block */}
        <div className="bg-black rounded-t-3xl h-full overflow-hidden pb-5 2xl:pb-10 flex flex-col">
          <h2
            ref={contactTitleRef}
            style={{
              transform: "translateX(-0.7vw) scaleY(1.25)",
              transformOrigin: "center",
            }}
            className="mx-auto w-full max-w-none overflow-visible whitespace-nowrap text-center font-oswald font-bold text-white leading-none tracking-[-0.07em] text-[22.7vw] md:text-[22.1vw]"
            aria-label={contactWord}
          >
            {[...contactWord].map((char, index) => (
              <span
                key={`${char}-${index}`}
                className="inline-block overflow-hidden align-top px-[0.035em] pt-[0.1em] pb-[0.08em] -mx-[0.035em] -mt-[0.1em]"
              >
                <span data-contact-letter className="inline-block">
                  {char}
                </span>
              </span>
            ))}
          </h2>
        </div>

        {/* Bottom area with floating yellow card */}
        <div
          ref={blackBottomRef}
          className="bg-backgroundlight lg:bg-black min-h-[20vh] lg:h-[30vh] relative rounded-b-3xl pb-10"
        >
          <section
            ref={formCardRef}
            className="relative z-60 -mb-[5vh] w-full -translate-y-[5vh] lg:absolute lg:top-0 lg:right-7 lg:mb-0 lg:w-[70vw] lg:translate-y-0"
          >
            <div className="rounded-t-3xl rounded-b-3xl bg-[#FFFF04] text-black grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 p-8 lg:p-12 pb-20 lg:pb-32">
              {/* Left: copy/testimonial */}
              <div className="flex flex-col gap-10">
                <div className="h-6 w-6 rounded-full bg-black/80" />
                <h3 className="font-bold leading-[0.95] tracking-[-0.03em] text-[clamp(4rem,8vw,3rem)] lg:text-[clamp(2.5rem,4.6vw,4.6rem)]">
                  <br />
                  Let&apos;s build
                  <br />
                  something worth remembering.
                </h3>
                <blockquote className="max-w-md">
                  <p className="text-lg font-semibold leading-snug">
                    &ldquo;They made the whole process feel clear and fast.
                    We’re really happy with where we landed.&rdquo;
                    <br />
                  </p>
                  <footer className="mt-3 text-sm font-semibold">
                    — Wendy, Jakarta
                  </footer>
                </blockquote>
                <p className="hidden lg:block mt-auto text-sm font-semibold">
                  Strategy, identity, and digital
                  <br />
                  for ambitious businesses.
                </p>
              </div>

              {/* Right: form */}
              <form className="flex flex-col w-full justify-center gap-8" aria-label="Start a project with Lokasight">
                {fields.map((field) => (
                  <label
                    key={field.label}
                    className="flex flex-col gap-2 text-lg font-semibold"
                  >
                    {field.label}
                    {field.type === "textarea" ? (
                      <textarea
                        name="project"
                        aria-label={field.label}
                        rows={1}
                        className="bg-transparent border-b-2 border-black/80 focus:outline-none resize-none"
                      />
                    ) : (
                      <input
                        name={field.label.toLowerCase().replace(/[^a-z]+/g, "-")}
                        type={field.label.includes("email") ? "email" : "text"}
                        autoComplete={field.label === "Your name" ? "name" : undefined}
                        aria-label={field.label}
                        className="bg-transparent border-b-2 border-black/80 focus:outline-none"
                      />
                    )}
                  </label>
                ))}
                <button
                  type="submit"
                  className="mt-4 w-full rounded-full bg-black text-white text-lg font-semibold py-4"
                >
                  Start the conversation
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
