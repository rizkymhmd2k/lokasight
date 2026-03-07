"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const contactTitleRef = useRef(null);
  const formCardRef = useRef(null);
  const blackBottomRef = useRef(null);

  /* ---------------------------------
   * Static content and breakpoints
   * --------------------------------- */
  const contactWord = "CONTACT";

  const fields = [
    { label: "Type your message here", type: "textarea" },
    { label: "Your name", type: "input" },
    { label: "you@email.com", type: "input" },
    { label: "Tell me about your project", type: "input" },
  ];

  const titleBreakpoints = [
    ["(max-width: 639px)", "top 74%"],
    ["(min-width: 640px) and (max-width: 767px)", "top 72%"],
    ["(min-width: 768px) and (max-width: 1023px)", "top 75%"],
    ["(min-width: 1024px) and (max-width: 1279px)", "top 60%"],
    ["(min-width: 1280px) and (max-width: 1535px)", "top 26%"],
    ["(min-width: 1536px)", "top 24%"],
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

      // < lg: keep old fixed offset behavior
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
              // markers: true,
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
              // markers: true,
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
      className="relative z-30 isolate w-full px-4 pt-24 flex flex-col bg-backgroundlight"
    >
      <div className="relative w-full rounded-t-3xl overflow-visible">
        {/* Top black title block */}
        <div className="bg-black rounded-t-3xl h-full pb-5 2xl:pb-10 flex flex-col">
          <h1
            ref={contactTitleRef}
            style={{ transform: "scaleY(1.25)" }}
            className="w-full whitespace-nowrap font-oswald font-bold text-white leading-none tracking-[-0.07em] text-[27vw] md:text-[29vw]"
            aria-label={contactWord}
          >
            {[...contactWord].map((char, index) => (
              <span
                key={`${char}-${index}`}
                className="inline-block overflow-hidden align-top"
              >
                <span data-contact-letter className="inline-block">
                  {char}
                </span>
              </span>
            ))}
          </h1>
        </div>

        {/* Bottom area with floating yellow card */}
        <div
          ref={blackBottomRef}
          className="bg-backgroundlight lg:bg-black min-h-[20vh] lg:h-[30vh] relative rounded-b-3xl pb-10"
        >
          <section
            ref={formCardRef}
            className="relative z-60 w-full lg:absolute lg:top-0 lg:right-7 lg:w-[70vw]"
          >
            <div className="rounded-t-3xl rounded-b-3xl bg-[#f6f44a] text-black grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 p-8 lg:p-12 pb-20 lg:pb-32">
              {/* Left: copy/testimonial */}
              <div className="flex flex-col gap-10">
                <div className="h-6 w-6 rounded-full bg-black/80" />
                <h1 className="font-bold leading-[0.95] tracking-[-0.03em] text-[clamp(4rem,8vw,3rem)] lg:text-[clamp(2.5rem,4.6vw,4.6rem)]">
                  Rizk moves fast,
                  <br />
                  moves faster
                  <br />
                  with formrizk
                </h1>
                <blockquote className="max-w-md">
                  <p className="text-lg font-semibold leading-snug">
                    &ldquo;Super smooth experience.&rdquo;
                    <br />
                    &ldquo;Everything was fast, clear, and hassle-free. I got
                    what I needed in minutes.&rdquo;
                  </p>
                  <footer className="mt-3 text-sm font-semibold">
                    — Alex R., Verified Customer
                  </footer>
                </blockquote>
                <p className="hidden lg:block mt-auto text-sm font-semibold">
                  web design, web development
                  <br />
                  and creative development
                </p>
              </div>

              {/* Right: form */}
              <form className="flex flex-col w-full justify-center gap-8">
                {fields.map((field) => (
                  <label
                    key={field.label}
                    className="flex flex-col gap-2 text-lg font-semibold"
                  >
                    {field.label}
                    {field.type === "textarea" ? (
                      <textarea
                        rows={1}
                        className="bg-transparent border-b-2 border-black/80 focus:outline-none resize-none"
                      />
                    ) : (
                      <input className="bg-transparent border-b-2 border-black/80 focus:outline-none" />
                    )}
                  </label>
                ))}
                <button
                  type="submit"
                  className="mt-4 w-full rounded-full bg-black text-white text-lg font-semibold py-4"
                >
                  Let&apos;s goooooo!!
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
