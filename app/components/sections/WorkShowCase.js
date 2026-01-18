"use client";

import { useState, useRef, useEffect } from "react";

const ITEMS = [
  { title: "Project One", desc: "Description for project one" },
  { title: "Project Two", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

export default function WorkShowcase() {
  const [bottomCards, setBottomCards] = useState([]);
  const refs = useRef([]);

  useEffect(() => {
    const observers = ITEMS.map((_, i) => {
      if (!refs.current[i]) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          // bottom of card hits bottom of viewport
          if (entry.boundingClientRect.bottom <= window.innerHeight) {
            setBottomCards((prev) =>
              prev.includes(i) ? prev : [...prev, i]
            );
          }
        },
        {
          threshold: 1, // full card must be in view
        }
      );

      observer.observe(refs.current[i]);
      return observer;
    });

    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  return (
    <section className="px-6 py-16 space-y-10">
      <h2 className="text-3xl font-semibold">Featured Works</h2>

      <div className="grid grid-cols-1 gap-y-18 place-items-center w-full">
        {ITEMS.map((item, i) => {
          const isActivated = bottomCards.includes(i);

          return (
            <div
              key={i}
              className="w-full flex justify-center p-4 border border-blue-600"
            >
              {/* INNER CARD */}
              <div
                ref={(el) => (refs.current[i] = el)}
                className={`
                  rounded-xl h-[50vh] w-[60%]
                  flex items-center justify-center p-6
                  transition-colors duration-300
                  ${
                    isActivated
                      ? "bg-red-500 text-white"
                      : "bg-yellow-500 border border-blue-600"
                  }
                `}
                style={{
                  transform: `
                    perspective(900px)
                    rotateX(18deg)
                    scaleY(0.95)
                  `,
                  transformOrigin: "center top",
                }}
              >
                <div className="text-center">
                  <h3 className="text-xl font-medium">{item.title}</h3>
                  <p className="mt-2">{item.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
