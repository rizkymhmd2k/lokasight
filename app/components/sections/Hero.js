"use client";

import { useLayoutEffect, useRef, useMemo, useCallback, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

const ANIMATION_DURATIONS = {
  CURTAIN: 0.9,
  ITEMS: 0.65,
  HAMBURGER_SHAPE: 0.25,
  COLOR: 0.25,
};

export default function Hero() {
  const navItems = useMemo(() => ["HOME", "WORK", "SERVICES", "CONTACT"], []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef   = useRef(null);
  const buttonRef = useRef(null);
  const tlRef     = useRef(null);

  const animateToX = useCallback((bars) => {
    gsap.to(bars[0], { rotate: 45,  y:  8, duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE });
    gsap.to(bars[1], { scaleX: 0,          duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE - 0.05 });
    gsap.to(bars[2], { rotate: -45, y: -8, duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE });
  }, []);

  const animateToHamburger = useCallback((bars) => {
    gsap.to(bars[0], { rotate: 0, y: 0, duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE });
    gsap.to(bars[1], { scaleX: 1,       duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE - 0.05, immediateRender: false });
    gsap.to(bars[2], { rotate: 0, y: 0, duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE });
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const bars  = buttonRef.current.querySelectorAll("span");
      const items = menuRef.current.querySelectorAll("[data-nav-item]");

      // Set initial state — items hidden below their containers
      gsap.set(items, { yPercent: 110 });

      tlRef.current = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.inOut" },
        onReverseComplete: () => {
          gsap.set(bars, { backgroundColor: "#000" });
          setIsMenuOpen(false);
        },
        onComplete: () => setIsMenuOpen(true),
      });

      // 1. Curtain slides down — full duration, nothing else
      tlRef.current.fromTo(
        menuRef.current,
        { yPercent: -100 },
        { yPercent: 0, duration: ANIMATION_DURATIONS.CURTAIN }
      );

      // 2. Only after curtain lands — items reveal upward with stagger
      tlRef.current.to(
        items,
        {
          yPercent: 0,
          stagger: 0.1,
          duration: ANIMATION_DURATIONS.ITEMS,
          ease: "power3.out",
        }
        // no overlap — starts exactly when curtain finishes
      );

      // Hamburger bars turn white immediately on open
      tlRef.current.to(
        bars,
        { backgroundColor: "#fff", duration: ANIMATION_DURATIONS.COLOR },
        0
      );
    });

    return () => ctx.revert();
  }, []);

  const toggleMenu = useCallback(() => {
    if (!tlRef.current) return;
    const bars = buttonRef.current.querySelectorAll("span");
    if (tlRef.current.progress() === 0 || tlRef.current.reversed()) {
      animateToX(bars);
      tlRef.current.play();
    } else {
      // On close — reverse sends items back down, then curtain pulls up
      animateToHamburger(bars);
      tlRef.current.reverse();
    }
  }, [animateToX, animateToHamburger]);

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

      if (isMenuOpen) toggleMenu();
    },
    [isMenuOpen, toggleMenu]
  );

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

        {/* Mobile Button */}
        <div className="sm:hidden flex justify-end">
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="flex flex-col gap-1.5 p-2 z-50 relative"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="w-6 h-0.5 bg-black transition-colors duration-150" />
            <span className="w-6 h-0.5 bg-black transition-colors duration-150" />
            <span className="w-6 h-0.5 bg-black transition-colors duration-150" />
          </button>
        </div>

        {/* Curtain Menu */}
        <div
          ref={menuRef}
          className="fixed inset-0 bg-black z-40 md:hidden flex flex-col justify-between p-6 pb-8"
          style={{ pointerEvents: isMenuOpen ? "auto" : "none" }}
        >
          {/* Top wordmark */}
          <div>
            <span className="text-white font-bold text-lg tracking-[-0.04em]">formrizk</span>
          </div>

          {/* Nav items — overflow-hidden on each wrapper is the mask */}
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <div key={item} className="overflow-hidden">
                <Link
                  href={`/#${item.toLowerCase()}`}
                  data-nav-item
                  className="block text-white font-bold leading-[0.88] tracking-[-0.04em] text-[17vw] hover:text-[#f6f44a] transition-colors duration-200"
                  onClick={handleNavClick(item.toLowerCase())}
                >
                  {item}
                </Link>
              </div>
            ))}
          </nav>

          {/* Bottom footer */}
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1.5">
              {[
                { label: "INSTAGRAM",   href: "#" },
                { label: "TWITTER / X", href: "#" },
                { label: "LINKEDIN",    href: "#" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-white/40 text-xs font-semibold tracking-widest hover:text-white transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="flex items-center gap-1.5 text-white/50 text-xs font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                AVAILABLE FOR WORK
              </span>
              <span className="text-white/30 text-xs font-semibold tracking-wide">©2026 FORMRIZK</span>
            </div>
          </div>
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
          <h2 className="text-lg md:text-xl font-semibold">WE DESIGN BOLD</h2>
          <h2 className="text-lg md:text-xl font-semibold">AND MODERN FORMS</h2>
        </div>
      </div>
    </section>
  );
}
