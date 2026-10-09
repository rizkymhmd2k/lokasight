"use client";

import { useMemo, useCallback } from "react";
import TextScramble from "../../shared/TextScramble.jsx";
import LokasightLogo from "../../shared/LokasightLogo.jsx";
import AnimatedEye from "../../shared/AnimatedEye.jsx";
import "./hero.css";

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

      <p className="hero__copy">
        The strongest brands aren't always the biggest. They're the easiest to
        understand. We help ambitious companies shape perception through
        strategy, identity, and digital experiences.
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
