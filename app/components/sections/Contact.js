"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    const container = containerRef.current;
    const scene = sceneRef.current;
    const card = cardRef.current;
    if (!container || !scene || !card) return;

    const state = { startBottom: 0, scrollBudget: 0 };

    const measure = () => {
      const cardHeight = card.offsetHeight;
      const sceneHeight = scene.offsetHeight;
      const isMobile = window.innerWidth < 1025;

      const visibleStart = cardHeight * (isMobile ? 0.5 : 0.2);
      const visibleEnd = cardHeight * 0.8;

      state.startBottom = -(cardHeight - visibleStart);
      state.scrollBudget = visibleEnd - visibleStart;

      container.style.height = `${sceneHeight + state.scrollBudget}px`;
    };

    const onScroll = () => {
      const { startBottom, scrollBudget } = state;
      const scrolled = -container.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0, scrolled / scrollBudget));
      card.style.bottom = `${startBottom + scrollBudget * progress}px`;
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

  return (
    <div
      id="contact"
      className="w-full px-4 pt-25 flex flex-col bg-backgroundlight"
    >
      <div ref={containerRef} className="relative">
        <div
          ref={sceneRef}
          className="sticky top-0 h-screen relative overflow-visible"
        >
          {/* Black hero card — full height on desktop, h-1/2 inside light bg wrapper on mobile */}
          <div className="w-full h-full rounded-3xl overflow-hidden flex flex-col bg-backgroundlight lg:bg-black">
            <div className="bg-black rounded-3xl overflow-hidden h-1/2 lg:h-full flex flex-col">
              <h1
                style={{ transform: "scaleY(1.25)" }}
                className="font-oswald font-bold text-white leading-none tracking-[-0.07em] text-[clamp(4rem,29vw,35rem)]"
              >
                CONTACT
              </h1>
            </div>
          </div>

          {/* Yellow card */}
          <section
            ref={cardRef}
            className="absolute left-1/2 -translate-x-1/2 w-full lg:left-auto lg:translate-x-0 lg:right-7 lg:w-[70vw]"
          >
            <div className="rounded-t-3xl rounded-b-3xl bg-[#f6f44a] text-black grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 p-8 lg:p-12 pb-20 lg:pb-30">
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
                    "Super smooth experience."
                    <br />
                    "Everything was fast, clear, and hassle-free. I got what I
                    needed in minutes."
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

              <form className="flex flex-col  w-full justify-center gap-8 ">
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
