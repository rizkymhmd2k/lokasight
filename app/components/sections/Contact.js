"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FIELDS = [
  { label: "Type your message here", type: "textarea" },
  { label: "Your name", type: "input" },
  { label: "you@email.com", type: "input" },
  { label: "Tell me about your project", type: "input" },
];

const Field = ({ label, type }) => (
  <label className="flex flex-col gap-2 text-lg font-semibold">
    {label}
    {type === "textarea" ? (
      <textarea
        rows={1}
        className="bg-transparent border-b-2 border-black/80 focus:outline-none resize-none"
      />
    ) : (
      <input className="bg-transparent border-b-2 border-black/80 focus:outline-none" />
    )}
  </label>
);

export default function Contact() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cardRef = useRef(null);
  const contactTitleRef = useRef(null);

  const contactWord = "CONTACT";

  useEffect(() => {
    const container = containerRef.current;
    const scene = sceneRef.current;
    const card = cardRef.current;
    if (!container || !scene || !card) return;

    const state = { startTop: 0, endTop: 0, scrollBudget: 0 };

    const measure = () => {
      const cardHeight = card.offsetHeight;
      const sceneHeight = scene.offsetHeight;
      const width = window.innerWidth;
      const isMobile = width < 1025;
      const isSmToMd = width >= 640 && width <= 1023;

      const visibleStart = cardHeight * (isMobile ? 0.5 : 0.2);
      const visibleEnd = cardHeight * 0.8;

      // Move by explicit top positions to avoid overshooting past the scene top.
      const smMdUnstickOffset = 40; // Tailwind `top-10`

      state.startTop = isSmToMd
        ? Math.max(sceneHeight - visibleStart, 0)
        : sceneHeight - visibleStart;
      state.endTop = isSmToMd
        ? Math.min(smMdUnstickOffset, state.startTop)
        : sceneHeight - visibleEnd;
      state.scrollBudget = Math.max(state.startTop - state.endTop, 1);

      container.style.height = `${sceneHeight + state.scrollBudget}px`;
      card.style.bottom = "auto";
    };

    const onScroll = () => {
      const { startTop, endTop, scrollBudget } = state;
      const scrolled = -container.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0, scrolled / scrollBudget));
      const nextTop = startTop + (endTop - startTop) * progress;
      card.style.top = `${nextTop}px`;
    };

    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.documentElement);
    ro.observe(card);

    window.addEventListener("scroll", onScroll, { passive: true });

    measure();
    onScroll();

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const title = contactTitleRef.current;
    if (!title) return;

    const letters = title.querySelectorAll("[data-contact-letter]");
    if (!letters.length) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(letters, { yPercent: 0, clearProps: "transform" });
        return;
      }

      gsap.set(letters, { yPercent: 120 });

      const mm = gsap.matchMedia();
      const makeTimeline = (startValue) => {
        gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: title,
            start: startValue,
            toggleActions: "restart none none reverse",
            markers: true,
          },
        }).to(letters, {
          yPercent: 0,
          duration: 0.65,
          stagger: 0.1,
          clearProps: "transform",
        });
      };

      // Tailwind-aligned breakpoints:
      // base: <640, sm: 640-767, md: 768-1023, lg: 1024-1279, xl: 1280-1535, 2xl: >=1536
      mm.add("(max-width: 639px)", () => makeTimeline("top 74%")); // base
      mm.add(
        "(min-width: 640px) and (max-width: 767px)",
        () => makeTimeline("top 72%") // sm
      );
      mm.add(
        "(min-width: 768px) and (max-width: 1023px)",
        () => makeTimeline("top 75%") // md
      );
      mm.add(
        "(min-width: 1024px) and (max-width: 1279px)",
        () => makeTimeline("top 60%") // lg
      );
      mm.add(
        "(min-width: 1280px) and (max-width: 1535px)",
        () => makeTimeline("top 26%") // xl
      );
      mm.add("(min-width: 1536px)", () => makeTimeline("top 24%")); // 2xl

      ScrollTrigger.refresh();
      return () => mm.revert();
    }, title);

    return () => ctx.revert();
  }, []);

	  return (
	    <div
	      id="contact"
	      className="w-full px-4 pt-24 flex flex-col bg-backgroundlight"
	    >
      <div ref={containerRef} className="relative">
        <div
          ref={sceneRef}
          className="sticky top-0 h-[90vh] relative overflow-visible"
        >
          {/* Black hero card — full height on desktop, h-1/2 inside light bg wrapper on mobile */}
          <div className="w-full h-full rounded-3xl overflow-hidden flex flex-col bg-backgroundlight lg:bg-black">
            <div className="bg-black rounded-3xl overflow-hidden h-1/2 lg:h-full flex flex-col">
              <h1
                ref={contactTitleRef}
                style={{ transform: "scaleY(1.25)" }}
                className="font-oswald font-bold text-white leading-none tracking-[-0.07em] text-[27vw] md:text-[29vw]"
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
          </div>

          {/* Yellow card */}
          <section
            ref={cardRef}
            className="absolute left-1/2 -translate-x-1/2 w-full lg:left-auto lg:translate-x-0 lg:right-7 lg:w-[70vw]"
          >
	            <div className="rounded-t-3xl rounded-b-3xl bg-[#f6f44a] text-black grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 p-8 lg:p-12 pb-20 lg:pb-32">
              <div className="flex flex-col gap-10 ">
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

	              <form className="flex flex-col w-full justify-center gap-8">
                {FIELDS.map((f) => (
                  <Field key={f.label} {...f} />
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
