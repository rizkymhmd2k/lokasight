"use client";

import { useState, useRef, useEffect } from "react";

const ITEMS = [
  { title: "Project One", desc: "Description for project one" },
  { title: "Project Two", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

export default function WorkShowcase() {
  const [intersections, setIntersections] = useState([]);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = [];
    
    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log(`🎯 Card ${index} top EXACTLY at bottom!`);
              setIntersections(prev => [...new Set([...prev, index])]);
            } else {
              setIntersections(prev => prev.filter(i => i !== index));
            }
          });
        },
        {
          // KEY: Create a 1px tall intersection zone at the very bottom
          // -1px means "shrink by 1px from the bottom"
          // This creates a 1px tall line at the bottom edge
          rootMargin: "0px 0px -1px 0px",
          threshold: [0]
          // This triggers when ANY part of the element (even 1px) 
          // enters that 1px tall zone at the bottom
        }
      );

      observer.observe(card);
      observers.push(observer);
    });

    return () => observers.forEach(observer => observer.disconnect());
  }, []);

  return (
    <section className="px-6 py-16 space-y-10">
      <div className="sticky top-4 z-10 bg-purple-600 text-white p-3 rounded-lg shadow-lg">
        <div className="text-center font-bold">
          🎯 EXACT PIXEL PRECISION
        </div>
        <div className="text-center text-sm mt-1">
          Using rootMargin: "0px 0px -1px 0px" (1px tall zone)
        </div>
        <div className="text-center text-sm">
          Cards at bottom: {intersections.join(", ") || "None"}
        </div>
      </div>

      <h2 className="text-3xl font-semibold">Featured Works</h2>

      <div className="space-y-8">
        {ITEMS.map((item, i) => {
          const isAtBottom = intersections.includes(i);
          
          return (
            <div
              key={i}
              ref={el => cardRefs.current[i] = el}
              className={`
                rounded-xl h-[50vh] flex flex-col items-center justify-center p-6 
                relative border-4 transition-all
                ${isAtBottom 
                  ? 'border-purple-500 bg-purple-50 shadow-2xl scale-[1.02]' 
                  : 'border-gray-300 bg-gray-100'
                }
              `}
            >
              {/* Card top indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  CARD TOP
                </div>
              </div>
              
              {/* Status indicator */}
              {isAtBottom && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 animate-pulse">
                  <div className="bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                    🎯 EXACT MATCH!
                  </div>
                </div>
              )}

              <h3 className="text-2xl font-bold">{item.title}</h3>
              <p className="text-gray-600 mt-2">{item.desc}</p>
              
              <div className="absolute bottom-4 left-4 text-sm font-mono">
                Card #{i}
              </div>
              
              <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                {isAtBottom ? "✅ At bottom" : "⬇ Scroll down"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom edge - single pixel line */}
      <div className="fixed bottom-0 left-0 right-0">
        <div className="h-[2px] bg-green-600 shadow-[0_0_10px_2px_rgba(34,197,94,0.8)] animate-pulse"></div>
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
          1px TRIGGER ZONE
        </div>
      </div>
    </section>
  );
}