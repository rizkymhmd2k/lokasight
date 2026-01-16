"use client";

import { useState, useRef, useEffect } from "react";

const ITEMS = [
  { title: "Project One", desc: "Description for project one" },
  { title: "Project Two", desc: "Description for project two" },
  { title: "Project Three", desc: "Description for project three" },
  { title: "Project Four", desc: "Description for project four" },
];

export default function WorkShowcase() {
  const [cardsAtBottom, setCardsAtBottom] = useState([]);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = [];

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setCardsAtBottom(prev => {
            if (entry.isIntersecting) {
              return [...new Set([...prev, index])];
            } else {
              return prev.filter(i => i !== index);
            }
          });
        },
        { rootMargin: "0px 0px -1px 0px", threshold: [0] }
      );

      observer.observe(card);
      observers.push(observer);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  return (
    <section className="px-6 py-16 space-y-10">
      <h2 className="text-3xl font-semibold">Featured Works</h2>

      <div className="space-y-8">
        {ITEMS.map((item, i) => {
          const isAtBottom = cardsAtBottom.includes(i);
          
          return (
            <div
              key={i}
              ref={el => cardRefs.current[i] = el}
              className={`
                rounded-xl h-[50vh] flex items-center justify-center p-6 
                transition-all duration-300
                ${isAtBottom ? 'bg-red-500 text-white' : 'bg-gray-200'}
              `}
            >
              <div className="text-center">
                <h3 className="text-xl font-medium">{item.title}</h3>
                <p className="mt-2">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}