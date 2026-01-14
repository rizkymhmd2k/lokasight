"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

const ITEMS = [
  { title: "Project One", desc: "Description for project one" },
  { title: "Project Two", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

export default function WorkShowcase() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const startScrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    const vh = window.innerHeight;

    const onScroll = ({ scroll }) => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();

      // before pin
      if (rect.top > 0) {
        startScrollRef.current = null;
        setActiveIndex(0);
        return;
      }

      // capture pin start once
      if (startScrollRef.current === null) {
        startScrollRef.current = scroll;
        return;
      }

      const delta = scroll - startScrollRef.current;
      const perCard = vh;

      const index = Math.min(
        ITEMS.length - 1,
        Math.max(0, Math.floor(delta / perCard))
      );

      setActiveIndex(index);

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const local = delta - i * perCard;
        const y = vh - local;

        card.style.transform = `translateY(${y}px)`;
      });
    };

    lenis.on("scroll", onScroll);

    return () => {
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  const safeIndex = Math.min(ITEMS.length - 1, Math.max(0, activeIndex));

  return (
    <section
      ref={sectionRef}
      style={{ height: `${(ITEMS.length + 1) * 100}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen grid grid-cols-2 gap-12 px-12 overflow-hidden">
        {/* LEFT */}
        <div className="flex flex-col justify-center">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            Featured Work
          </p>
          <h2 className="mt-4 text-4xl font-semibold">
            {ITEMS[safeIndex]?.title}
          </h2>
          <p className="mt-2 text-neutral-600 max-w-md">
            {ITEMS[safeIndex]?.desc}
          </p>
        </div>

        {/* RIGHT */}
        <div className="relative overflow-hidden">
          {ITEMS.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => (cardsRef.current[i] = el)}
              style={{ transform: "translateY(100vh)" }}
              className="absolute inset-0 m-auto h-[60vh] w-[80%]
                         rounded-xl bg-neutral-200 flex items-center
                         justify-center text-2xl font-medium
                         will-change-transform"
            >
              {item.title}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
