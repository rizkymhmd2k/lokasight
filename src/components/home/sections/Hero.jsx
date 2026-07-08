"use client";

import { useMemo, useCallback } from "react";
import LokasightLogo from "../../shared/LokasightLogo.jsx";

export default function Hero({ children }) {
  const navItems = useMemo(
    () => ["HOME", "WORK", "SERVICES", "ABOUT", "CONTACT"],
    [],
  );
  const handleNavClick = useCallback(
    (sectionId) => (e) => {
      if (typeof window === "undefined") return;

      const onHome =
        window.location.pathname === "/" || window.location.pathname === "";
      const el = onHome ? document.getElementById(sectionId) : null;

      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `#${sectionId}`);
      }
    },
    [],
  );
  const handleCtaClick = useCallback((e) => {
    if (typeof window === "undefined") return;

    const el = document.getElementById("work");
    if (!el) return;

    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", "#work");
  }, []);

  return (
    <section
      id="home"
      className="px-4 py-4 flex flex-col justify-between h-screen "
    >
      <div className="w-full relative">
        {/* Desktop Nav */}
        <div className="hidden sm:grid grid-cols-5 relative z-50">
          {navItems.map((item, i) => (
            <div
              key={item}
              className={i === navItems.length - 1 ? "text-right" : ""}
            >
              <a
                href={`/#${item.toLowerCase()}`}
                className="text-xs font-bold hover:opacity-70 transition-opacity text-gray-800"
                onClick={handleNavClick(item.toLowerCase())}
              >
                {item}
              </a>
            </div>
          ))}
        </div>

        {/* Hero */}
        <LokasightLogo className="mt-8  " />
        <div className="relative mt-16 md:mt-4 flex justify-center ">
          <div className="relative ">
            <p className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap font-oswald text-base font-bold md:left-auto md:right-full md:top-1/2 md:bottom-auto md:mr-5 md:mb-0 md:-translate-x-0 md:-translate-y-1/2 md:text-2xl">
              branding
            </p>
            {children}
            <p className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap font-oswald text-base font-bold md:left-full md:top-1/2 md:mt-0 md:ml-5 md:-translate-x-0 md:-translate-y-1/2 md:text-2xl">
              studio
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4">
          <div className="col-start-2 max-sm:col-start-1 col-span-2 flex items-center gap-2">
            {/* <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm md:text-base">clarity creates preference</h2> */}
          </div>
          <div className="col-start-4 text-right">
            {/* <h2 className="text-xl lg:text-2xl font-bold tracking-[-0.04em] translate-y-[-20px] lg:translate-y-[-40px]">Studio</h2> */}
          </div>
        </div>
      </div>

      <div className="grid w-full gap-8 sm:grid-cols-4 sm:items-end">
        <div className="order-2 max-w-sm sm:order-none sm:col-span-2 lg:col-span-1">
          <p className="text-sm leading-relaxed md:text-md">
            The strongest businesses aren't always the biggest. They're the
            easiest to understand. We help ambitious companies shape perception
            through strategy, identity, and digital experiences.{" "}
          </p>
        </div>
        <div className="order-1 flex flex-col items-start sm:order-none sm:col-span-2 lg:col-span-1 lg:col-start-4 sm:text-right sm:items-end">
          {/* <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-[-0.04em] md:text-xl">
            Strategy
            </h2>
            <h2 className="text-xl font-semibold tracking-[-0.04em] md:text-xl">
            Identity
            </h2>
            <h2 className="text-xl font-semibold tracking-[-0.04em] md:text-xl">
            Digital
            </h2>
          </div> */}
          <a
            href="/#work"
            onClick={handleCtaClick}
            className="group mt-5 inline-flex rounded-md bg-black px-5 py-3 text-[#F8F7F3] sm:mt-6 sm:self-end sm:px-4 sm:py-2.5"
          >
            <span className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.08em]">
              <span>View our work</span>
              <span className="relative flex h-4 w-5 overflow-hidden">
                <span className="absolute inset-0 transition-transform duration-300 ease-out group-hover:translate-x-full">
                  →
                </span>
                <span className="absolute inset-0 -translate-x-full transition-transform duration-300 ease-out group-hover:translate-x-0">
                  →
                </span>
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
