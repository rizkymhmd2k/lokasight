"use client";

import {
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import Link from "next/link";
import gsap from "gsap";
import HeroWordmark3D from "./HeroWordmark3D";

// Constants for centralized timing control
const ANIMATION_DURATIONS = {
  CURTAIN: 0.9,
  ITEMS: 0.7,
  HAMBURGER_SHAPE: 0.25,
  COLOR: 0.25,
};

export default function Hero() {
  // Static data memoized
  const navItems = useMemo(() => ["HOME", "WORK", "SERVICES", "CONTACT"], []);

  // State for menu status
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Refs
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const tlRef = useRef(null);

  // Reusable animation functions
  const animateToX = useCallback((bars) => {
    gsap.to(bars[0], {
      rotate: 45,
      y: 8,
      duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE,
    });
    gsap.to(bars[1], {
      scaleX: 0,
      duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE - 0.05,
    });
    gsap.to(bars[2], {
      rotate: -45,
      y: -8,
      duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE,
    });
  }, []);

  const animateToHamburger = useCallback((bars) => {
    gsap.to(bars[0], {
      rotate: 0,
      y: 0,
      duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE,
    });
    gsap.to(bars[1], {
      scaleX: 1,
      duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE - 0.05,
      immediateRender: false, // Prevents flash on initial render
    });
    gsap.to(bars[2], {
      rotate: 0,
      y: 0,
      duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE,
    });
  }, []);

  // Setup timeline
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const bars = buttonRef.current.querySelectorAll("span");
      const items = menuRef.current.querySelectorAll("[data-nav-item]");

      tlRef.current = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.inOut" },
        onReverseComplete: () => {
          gsap.set(bars, { backgroundColor: "#000" });
          setIsMenuOpen(false);
        },
        onComplete: () => {
          setIsMenuOpen(true);
        },
      });

      // Curtain animation
      tlRef.current.fromTo(
        menuRef.current,
        { yPercent: -100 },
        {
          yPercent: 0,
          duration: ANIMATION_DURATIONS.CURTAIN,
        },
      );

      // Menu items animation
      tlRef.current.from(
        items,
        {
          yPercent: -120,
          stagger: 0.08,
          duration: ANIMATION_DURATIONS.ITEMS,
        },
        `-=${ANIMATION_DURATIONS.CURTAIN * 0.5}`, // Better timing calculation
      );

      // Color change only
      tlRef.current.to(
        bars,
        {
          backgroundColor: "#fff",
          duration: ANIMATION_DURATIONS.COLOR,
        },
        0,
      );
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  // Memoized toggle handler
  const toggleMenu = useCallback(() => {
    if (!tlRef.current) return;
    const bars = buttonRef.current.querySelectorAll("span");

    if (tlRef.current.progress() === 0 || tlRef.current.reversed()) {
      // Opening menu
      animateToX(bars);
      tlRef.current.play();
    } else {
      // Closing menu
      animateToHamburger(bars);
      tlRef.current.reverse();
    }
  }, [animateToX, animateToHamburger]);

  // Handle menu item clicks
  const handleMenuItemClick = useCallback(() => {
    if (isMenuOpen) {
      toggleMenu();
    }
  }, [isMenuOpen, toggleMenu]);

  return (
    <section className="px-4 py-4 flex flex-col justify-between h-screen bg-[linear-gradient(180deg,rgba(206,216,54,0.5)_0%,#F8F7F3_40%)] ">
      <div className="w-full relative">
        {/* Desktop Nav */}
        <div className="hidden sm:grid grid-cols-4">
          {navItems.map((item, i) => (
            <div key={item} className={i === 3 ? "text-right" : ""}>
              <Link
                href={`/#${item.toLowerCase()}`}
                className="font-bold hover:opacity-70 transition-opacity"
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
          className="fixed inset-0 bg-black p-6 z-40 md:hidden pointer-events-none"
          style={{ pointerEvents: isMenuOpen ? "auto" : "none" }}
        >
          <div className="flex flex-col gap-6 mt-20">
            {navItems.map((item) => (
              <div
                key={item}
                className="overflow-hidden border-b border-white/20"
              >
                <Link
                  href={`/#${item.toLowerCase()}`}
                  data-nav-item
                  className="block text-white text-5xl py-2 leading-[0.5] hover:text-gray-300 transition-colors"
                  onClick={handleMenuItemClick}
                >
                  {item}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Hero */}
        {reduceMotion ? (
          <h1 className="text-[27vw] font-bold tracking-[-0.04em] leading-[0.8] text-center">
            formrizk
          </h1>
        ) : (
          <>
            <div className="hidden sm:block">
              <HeroWordmark3D />
            </div>
            <h1 className="sm:hidden text-[27vw] font-bold tracking-[-0.04em] leading-[0.8] text-center">
              formrizk
            </h1>
          </>
        )}

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
