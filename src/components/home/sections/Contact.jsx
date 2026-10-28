"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import AnimatedSectionTitle from "../../shared/AnimatedSectionTitle.jsx";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const formCardRef = useRef(null);
  const blackBottomRef = useRef(null);

  /* ---------------------------------
   * Static content and breakpoints
   * --------------------------------- */
  const fields = [
    { label: "Tell us about your project", type: "textarea" },
    { label: "Your name", type: "input" },
    { label: "you@email.com", type: "input" },
    { label: "What are you building?", type: "input" },
  ];

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
      className="relative z-30 isolate w-full overflow-x-clip px-frame md:pb-24 flex flex-col bg-backgroundlight"
    >
      <div className="relative w-full rounded-t-3xl overflow-visible">
        {/* Top black title block */}
        <div className="bg-black px-card rounded-t-3xl h-full overflow-hidden py-10 sm:py-14 md:py-section flex flex-col">
          <AnimatedSectionTitle text="CONTACT" />
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
            <div className="rounded-t-3xl rounded-b-3xl bg-[#FFFF04] text-black grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 px-card pt-6 md:pt-8 lg:pt-12 pb-20 lg:pb-32">
              {/* Left: copy/testimonial */}
              <div className="flex flex-col gap-10">
                <div className="h-6 w-6 rounded-full bg-black/80" />
                <h3 className="font-semibold leading-[0.95] tracking-[-0.02em] text-[clamp(2.5rem,10vw,4rem)] lg:text-[clamp(2.5rem,4.6vw,4.6rem)]">
                  <br />
                  Let&apos;s build
                  <br />
                  something worth remembering.
                </h3>
                <blockquote className="max-w-md">
                  <p className="font-display text-lg font-semibold leading-[1.3]">
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
                    className="flex flex-col gap-2 text-base font-normal leading-[1.4]"
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
                  className="mt-4 w-full rounded-full bg-black text-white text-sm font-normal leading-[1.5] py-4"
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
