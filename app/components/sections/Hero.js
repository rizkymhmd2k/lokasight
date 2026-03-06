"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";

export default function Hero() {
  const navItems = useMemo(() => ["HOME", "WORK", "SERVICES", "CONTACT"], []);
  const handleNavClick = useCallback(
    (sectionId) => (e) => {
      if (typeof window === "undefined") return;

      const onHome = window.location.pathname === "/" || window.location.pathname === "";
      const el = onHome ? document.getElementById(sectionId) : null;

      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `#${sectionId}`);
      }
    },
    []
  );
  const handleCtaClick = useCallback((e) => {
    if (typeof window === "undefined") return;

    const el = document.getElementById("contact");
    if (!el) return;

    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", "#contact");
  }, []);

  return (
    <section
      id="home"
      className="px-4 py-4 flex flex-col justify-between h-screen bg-[linear-gradient(180deg,rgba(206,216,54,0.5)_0%,#F8F7F3_40%)]"
    >
      <div className="w-full relative">

        {/* Desktop Nav */}
        <div className="hidden sm:grid grid-cols-4 relative z-50">
          {navItems.map((item, i) => (
            <div key={item} className={i === 3 ? "text-right" : ""}>
              <Link
                href={`/#${item.toLowerCase()}`}
                className="font-bold hover:opacity-70 transition-opacity"
                onClick={handleNavClick(item.toLowerCase())}
              >
                {item}
              </Link>
            </div>
          ))}
        </div>

        {/* Hero */}
        <h1 className="pointer-events-none text-[27vw] font-bold tracking-[-0.04em] leading-[0.8] text-center">
          formrizk
        </h1>

        <div className="grid grid-cols-4">
          <div className="col-start-2 max-sm:col-start-1 col-span-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm md:text-base">working globally</h2>
          </div>
          <div className="col-start-4 text-right">
            <h2 className="text-2xl font-bold tracking-[-0.04em]">STUDIO</h2>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-4">
        <div className="col-span-1">
          <p className="text-sm md:text-md">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
        <div className="col-start-4 flex flex-col text-right">
          <h2 className="text-lg md:text-xl font-semibold">lorem</h2>
          <h2 className="text-lg md:text-xl font-semibold">Aipsum</h2>
          <Link
            href="/#contact"
            onClick={handleCtaClick}
            className="group mt-6 inline-flex self-end rounded-md bg-black px-4 py-2.5 text-[#F8F7F3]"
          >
            <span className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.08em]">
              <span>Let&apos;s connect</span>
              <span className="relative flex h-4 w-5 overflow-hidden">
                <span className="absolute inset-0 transition-transform duration-400 ease-out group-hover:translate-x-full">
                  →
                </span>
                <span className="absolute inset-0 -translate-x-full transition-transform duration-400 ease-out group-hover:translate-x-0">
                  →
                </span>
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
