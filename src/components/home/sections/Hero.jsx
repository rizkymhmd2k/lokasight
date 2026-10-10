"use client";

import { useMemo, useCallback } from "react";
import TextScramble from "../../shared/TextScramble.jsx";
import LokasightLogo from "../../shared/LokasightLogo.jsx";
import AnimatedEye from "../../shared/AnimatedEye.jsx";
import "./hero.css";

function CopyGraphic({ type }) {
  return (
    <span
      className={`hero__copy-graphic hero__copy-graphic--${type}`}
      aria-hidden="true"
    >
      {type === "spark" ? (
        <svg viewBox="0 0 106 104" fill="none" focusable="false">
          <path d="m53 2 9 30 28-17-13 29 28 6-29 9 19 24-31-12-8 31-10-30-29 18 14-30-30-7 31-10L12 20l32 12L53 2Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 160 100" fill="none" focusable="false">
          <g stroke="currentColor" strokeWidth="1.7">
            <ellipse cx="80" cy="50" rx="75" ry="28" />
            <ellipse cx="80" cy="50" rx="50" ry="28" />
            <ellipse cx="80" cy="50" rx="20" ry="28" />
            <ellipse cx="80" cy="50" rx="11" ry="28" />
            <path d="M5 50h150" />
          </g>
        </svg>
      )}
    </span>
  );
}

export default function Hero() {
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
        el.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
          block: "start",
        });
        window.history.pushState(null, "", `#${sectionId}`);
      }
    },
    [],
  );
  return (
    <section id="home" className="hero">
      <header className="hero__header">
        <a
          href="/#home"
          aria-label="Lokasight home"
          className="hero__eye"
          onClick={handleNavClick("home")}
        >
          <AnimatedEye />
        </a>
        <nav aria-label="Hero navigation" className="hero__nav">
          {navItems.map((item) => (
            <a
              key={item}
              href={`/#${item.toLowerCase()}`}
              aria-label={item}
              onClick={handleNavClick(item.toLowerCase())}
            >
              <TextScramble>{item}</TextScramble>
            </a>
          ))}
        </nav>
      </header>

      <p
        className="hero__copy"
        aria-label="The strongest brands aren't always the biggest. They're the easiest to understand. We help ambitious companies shape perception through strategy, identity, and digital experiences."
      >
        The strongest brands <CopyGraphic type="spark" /> aren't always the
        biggest. They're the easiest to understand. We help ambitious companies
        shape perception <CopyGraphic type="orbit" /> through strategy,
        identity, and digital experiences.
      </p>

      <div className="hero__brand">
        <div className="hero__disciplines" aria-label="Our disciplines">
          <span>Strategy</span>
          <span>Identity</span>
          <span>Digital</span>
        </div>
        <h1 className="hero__wordmark">
          <span className="sr-only">Lokasight</span>
          <span aria-hidden="true" className="hero__logo">
            <LokasightLogo animation="slide" />
          </span>
        </h1>
      </div>
    </section>
  );
}
