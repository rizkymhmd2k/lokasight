"use client";

import { useMemo, useCallback } from "react";
import LokasightLogo from "../../shared/LokasightLogo.jsx";
import TextScramble from "../../shared/TextScramble.jsx";
import Button from "../../shared/Button.jsx";

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

    const el = document.getElementById("contact");
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
      <div className="w-full relative h-full flex flex-col justify-between">
        {/* Desktop Nav */}
        <div className="hidden sm:grid grid-cols-5 relative z-50">
          {navItems.map((item, i) => (
            <div
              key={item}
              className={i === navItems.length - 1 ? "text-right" : ""}
            >
              <a
                href={`/#${item.toLowerCase()}`}
                aria-label={item}
                className="text-xs font-bold"
                onClick={handleNavClick(item.toLowerCase())}
              >
                <TextScramble>{item}</TextScramble>
              </a>
            </div>
          ))}
        </div>

        {/* Hero */}
        <LokasightLogo className="mt-8" />
        <div className="relative flex justify-center ">
          <div className="relative ">
            <p className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap font-oswald text-base font-medium text-neutral-500 md:left-auto md:right-full md:top-1/2 md:bottom-auto md:mr-5 lg:mr-25 md:mb-0 md:-translate-x-0 md:-translate-y-1/2 md:text-xl lg:text-2xl">
              [<TextScramble>BRAND</TextScramble>]
            </p>
            {children}
            <p className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap font-oswald text-base font-medium text-neutral-500 md:left-full md:top-1/2 md:mt-0 md:ml-5 lg:ml-25 md:-translate-x-0 md:-translate-y-1/2 md:text-xl lg:text-2xl">
              [<TextScramble>STUDIO</TextScramble>]
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 ">
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
            The strongest brands aren't always the biggest. They're the
            easiest to understand. {" "}
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
          <Button
            href="/#work"
            onClick={handleCtaClick}
            className="mt-5 sm:mt-6 sm:self-end"
          >
            contact now
          </Button>
        </div>
      </div>
    </section>
  );
}
