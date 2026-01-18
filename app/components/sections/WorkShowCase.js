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
          setBottomCards(prev => 
            entry.isIntersecting 
              ? [...prev, i] 
              : prev.filter(idx => idx !== i)
          );
        },
        { rootMargin: "0px 0px -1px 0px", threshold: 0 }
      );
      
      observer.observe(refs.current[i]);
      return observer;
    });

    return () => observers.forEach(obs => obs?.disconnect());
  }, []);

  return (
    <section className="px-6 py-16 space-y-10">
      <h2 className="text-3xl font-semibold">Featured Works</h2>
      
      <div className="space-y-8 w-full flex flex-col items-center">
        {ITEMS.map((item, i) => (
          <div
            key={i}
            ref={el => refs.current[i] = el}
            className={`
              rounded-xl h-[50vh] w-[60%] flex items-center justify-center p-6
              transition-all duration-300
              ${bottomCards.includes(i) ? 'bg-red-500 text-white' : 'bg-gray-200'}
            `}
          >
            <div className="text-center">
              <h3 className="text-xl font-medium">{item.title}</h3>
              <p className="mt-2">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}