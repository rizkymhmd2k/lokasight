"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";

const ITEMS = [
  { title: "Project One", desc: "Description for project one" },
  { title: "Project Two", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
];

export default function WorkShowcase() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const startScrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });

    const raf = (t) => {
      lenis.raf(t);
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
        return;
      }

      // capture pin start
      if (startScrollRef.current === null) {
        startScrollRef.current = scroll;
      }

      const delta = scroll - startScrollRef.current;
      const total = vh * ITEMS.length;
      const progress = Math.min(Math.max(delta / total, 0), 1);

      const index = Math.min(
        ITEMS.length - 1,
        Math.floor(progress * ITEMS.length)
      );
      setActiveIndex(index);

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const cardProgress = Math.min(
          Math.max(progress * ITEMS.length - i, 0),
          1
        );

        const y = (1 - cardProgress) * vh;
        card.style.transform = `translateY(${y}px)`;
      });
    };

    lenis.on("scroll", onScroll);

    return () => {
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen grid grid-cols-2 gap-12 px-12 overflow-hidden">
        {/* LEFT COLUMN */}
        <div className="flex flex-col justify-center">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            Featured Work
          </p>

          <h2 className="mt-4 text-4xl font-semibold">
            {ITEMS[activeIndex].title}
          </h2>

          <p className="mt-2 text-neutral-600 max-w-md">
            {ITEMS[activeIndex].desc}
          </p>
        </div>

        {/* RIGHT COLUMN */}
        <div className="relative flex items-center">
          <div className="relative w-full h-full">
            {ITEMS.map((item, i) => (
              <div
                key={item.title}
                ref={(el) => (cardsRef.current[i] = el)}
                style={{ transform: "translateY(100vh)" }}
                className="absolute left-0 right-0 mx-auto h-[60vh] w-[80%]
                           rounded-xl bg-neutral-200 flex items-center
                           justify-center text-2xl will-change-transform"
              >
                {item.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
