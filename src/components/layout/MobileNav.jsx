"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

const ANIMATION_DURATIONS = {
  CURTAIN: 0.9,
  ITEMS: 0.65,
  HAMBURGER_SHAPE: 0.25,
};
const SCROLL_RETRY_DELAY_MS = 80;
const DARK_BG_THRESHOLD = 0.42;
const NAV_ITEMS = ["HOME", "WORK", "SERVICES", "CONTACT"];
const SOCIAL_LINKS = [
  { label: "INSTAGRAM", href: "#" },
  { label: "TWITTER / X", href: "#" },
  { label: "LINKEDIN", href: "#" },
];

function parseRgb(color) {
  if (!color) return null;
  const match = color.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(",").map((p) => Number.parseFloat(p.trim()));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [r, g, b, a = 1] = parts;
  if (a === 0) return null;
  return { r, g, b };
}

function luminance({ r, g, b }) {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function getEffectiveBgRgb(startEl) {
  let el = startEl;
  for (let i = 0; i < 14 && el; i += 1) {
    const style = window.getComputedStyle(el);
    const bg = style.backgroundColor;
    const rgb = parseRgb(bg);
    if (rgb) return rgb;

    if (style.backgroundImage && style.backgroundImage !== "none") {
      return null;
    }
    el = el.parentElement;
  }

  const bodyRgb = parseRgb(window.getComputedStyle(document.body).backgroundColor);
  return bodyRgb || { r: 255, g: 255, b: 255 };
}

export default function MobileNav() {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [measuredIsDarkBg, setMeasuredIsDarkBg] = useState(false);

  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const tlRef = useRef(null);

  const scrollYRef = useRef(0);
  const skipNextUnlockRestoreRef = useRef(false);
  const pendingSectionRef = useRef(null);
  const pendingSectionRetryTimeoutRef = useRef(0);

  const lockPageScroll = useCallback(() => {
    const body = document.body;
    const html = document.documentElement;
    if (!body || body.dataset.navLocked === "true") return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    scrollYRef.current = scrollY;

    body.dataset.navLocked = "true";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
  }, []);

  const unlockPageScroll = useCallback((restorePosition = true) => {
    const body = document.body;
    const html = document.documentElement;
    if (!body || body.dataset.navLocked !== "true") return;

    delete body.dataset.navLocked;
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
    html.style.overflow = "";

    if (restorePosition) window.scrollTo(0, scrollYRef.current || 0);
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return false;

    const top = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset);
    window.scrollTo({ top, behavior: "auto" });
    window.history.pushState(null, "", `#${sectionId}`);
    return true;
  }, []);

  const flushPendingSectionScroll = useCallback(() => {
    const sectionId = pendingSectionRef.current;
    if (!sectionId) return;
    pendingSectionRef.current = null;

    const didScroll = scrollToSection(sectionId);
    if (!didScroll) {
      window.location.assign(`/#${sectionId}`);
      return;
    }

    // Mobile Safari can ignore the first jump right after fixed-body unlock.
    if (pendingSectionRetryTimeoutRef.current) {
      window.clearTimeout(pendingSectionRetryTimeoutRef.current);
    }
    pendingSectionRetryTimeoutRef.current = window.setTimeout(() => {
      pendingSectionRetryTimeoutRef.current = 0;
      scrollToSection(sectionId);
    }, SCROLL_RETRY_DELAY_MS);
  }, [scrollToSection]);

  const animateToX = useCallback((bars) => {
    gsap.to(bars[0], { rotate: 45, y: 8, duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE });
    gsap.to(bars[1], {
      scaleX: 0,
      duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE - 0.05,
    });
    gsap.to(bars[2], { rotate: -45, y: -8, duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE });
  }, []);

  const animateToHamburger = useCallback((bars) => {
    gsap.to(bars[0], { rotate: 0, y: 0, duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE });
    gsap.to(bars[1], {
      scaleX: 1,
      duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE - 0.05,
      immediateRender: false,
    });
    gsap.to(bars[2], { rotate: 0, y: 0, duration: ANIMATION_DURATIONS.HAMBURGER_SHAPE });
  }, []);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const menu = menuRef.current;
    const button = buttonRef.current;
    if (!wrapper || !menu || !button) return;

    const ctx = gsap.context(() => {
      const bars = button.querySelectorAll("[data-bar]");
      const items = menu.querySelectorAll("[data-nav-item]");

      gsap.set(items, { yPercent: 110 });

      tlRef.current = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.inOut" },
        onReverseComplete: () => {
          setIsMenuActive(false);
          const shouldRestore = !skipNextUnlockRestoreRef.current;
          skipNextUnlockRestoreRef.current = false;
          unlockPageScroll(shouldRestore);
          requestAnimationFrame(() => {
            flushPendingSectionScroll();
          });
        },
      });

      tlRef.current.fromTo(menu, { yPercent: -100 }, { yPercent: 0, duration: ANIMATION_DURATIONS.CURTAIN });
      tlRef.current.to(items, {
        yPercent: 0,
        stagger: 0.1,
        duration: ANIMATION_DURATIONS.ITEMS,
        ease: "power3.out",
      });

      gsap.set(bars, { rotate: 0, y: 0, scaleX: 1 });
    }, wrapper);

    return () => ctx.revert();
  }, [flushPendingSectionScroll, unlockPageScroll]);

  useEffect(() => {
    return () => {
      if (pendingSectionRetryTimeoutRef.current) {
        window.clearTimeout(pendingSectionRetryTimeoutRef.current);
      }
      pendingSectionRef.current = null;
      skipNextUnlockRestoreRef.current = false;
      unlockPageScroll();
    };
  }, [unlockPageScroll]);

  const toggleMenu = useCallback(() => {
    if (!tlRef.current || !buttonRef.current) return;
    const bars = buttonRef.current.querySelectorAll("[data-bar]");

    if (tlRef.current.progress() === 0 || tlRef.current.reversed()) {
      lockPageScroll();
      setIsButtonVisible(true);
      setIsMenuActive(true);
      animateToX(bars);
      tlRef.current.play();
    } else {
      animateToHamburger(bars);
      tlRef.current.reverse();
    }
  }, [animateToHamburger, animateToX, lockPageScroll]);

  const handleNavClick = useCallback(
    (sectionId) => (e) => {
      const el = document.getElementById(sectionId);
      const isLocked = document.body?.dataset.navLocked === "true";
      const menuIsOpen = Boolean(
        tlRef.current &&
          tlRef.current.progress() > 0 &&
          !tlRef.current.reversed()
      );

      if (el) {
        e.preventDefault();

        if (isLocked || isMenuActive || menuIsOpen) {
          // Section click should not snap back to pre-menu scroll position.
          skipNextUnlockRestoreRef.current = true;
          pendingSectionRef.current = sectionId;
          if (menuIsOpen) {
            toggleMenu();
          } else {
            unlockPageScroll(false);
            flushPendingSectionScroll();
          }
        } else {
          scrollToSection(sectionId);
        }
        return;
      }

      if (isLocked || isMenuActive || menuIsOpen) {
        e.preventDefault();
        if (menuIsOpen) toggleMenu();
        window.location.assign(`/#${sectionId}`);
      }
    },
    [flushPendingSectionScroll, isMenuActive, scrollToSection, toggleMenu, unlockPageScroll]
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isMenuActive) toggleMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuActive, toggleMenu]);

  useEffect(() => {
    let raf = 0;
    const lastYRef = { current: window.scrollY || 0 };

    const update = () => {
      raf = 0;
      const currentY = window.scrollY || 0;
      const delta = currentY - lastYRef.current;
      lastYRef.current = currentY;

      if (isMenuActive) {
        setIsButtonVisible(true);
        return;
      }

      const showThreshold = 4;
      const hideThreshold = 12;
      if (currentY < 12) setIsButtonVisible(true);
      else if (delta < -showThreshold) setIsButtonVisible(true);
      else if (delta > hideThreshold) setIsButtonVisible(false);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [isMenuActive]);

  const computeTheme = useCallback(() => {
    const wrapper = wrapperRef.current;
    const button = buttonRef.current;
    if (!wrapper || !button) return;

    const rect = button.getBoundingClientRect();
    const sampleX = Math.min(window.innerWidth - 1, Math.max(0, rect.left + rect.width / 2));
    const sampleY = Math.min(window.innerHeight - 1, Math.max(0, rect.top + rect.height / 2));

    const stack = document.elementsFromPoint(sampleX, sampleY);
    let behind = null;
    for (const el of stack) {
      if (!wrapper.contains(el)) {
        behind = el;
        break;
      }
    }
    if (!behind) behind = document.body;

    const rgb = getEffectiveBgRgb(behind);
    if (!rgb) {
      setMeasuredIsDarkBg(false);
      return;
    }

    setMeasuredIsDarkBg(luminance(rgb) < DARK_BG_THRESHOLD);
  }, []);

  useEffect(() => {
    if (isMenuActive) return;

    let raf = 0;
    const onScrollOrResize = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        computeTheme();
      });
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [computeTheme, isMenuActive]);

  const isDarkBg = isMenuActive || measuredIsDarkBg;
  const barClass = isDarkBg ? "bg-white" : "bg-black";
  const buttonShellClass = isDarkBg
    ? "border-white/15 bg-black/30"
    : "border-black/10 bg-white/60";

  return (
    <div ref={wrapperRef} className="sm:hidden fixed inset-0 z-[60] pointer-events-none">
      <div className="fixed top-4 right-4 z-[70] pointer-events-auto">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          aria-label={isMenuActive ? "Close menu" : "Open menu"}
          aria-expanded={isMenuActive}
          aria-controls="mobile-curtain-menu"
          className={[
            "grid place-items-center rounded-full border backdrop-blur-md",
            "w-12 h-12",
            "transition-[transform,opacity,background-color,border-color] duration-200 ease-out",
            isButtonVisible || isMenuActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none",
            buttonShellClass,
          ].join(" ")}
        >
          <span className="flex flex-col gap-1.5">
            <span data-bar className={`block w-6 h-0.5 ${barClass} transition-colors duration-200`} />
            <span data-bar className={`block w-6 h-0.5 ${barClass} transition-colors duration-200`} />
            <span data-bar className={`block w-6 h-0.5 ${barClass} transition-colors duration-200`} />
          </span>
        </button>
      </div>

      <div
        id="mobile-curtain-menu"
        ref={menuRef}
        className="fixed inset-0 bg-black z-[65] flex flex-col justify-between p-6 pb-8 overflow-y-auto overscroll-contain"
        style={{ pointerEvents: isMenuActive ? "auto" : "none" }}
        onClick={(e) => {
          if (e.target === e.currentTarget && isMenuActive) toggleMenu();
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-lg tracking-[-0.04em]">formrizk</span>
          <span className="text-white/40 text-xs font-semibold tracking-widest">MENU</span>
        </div>

        <nav className="flex flex-col mt-8">
          {NAV_ITEMS.map((item) => (
            <div key={item} className="overflow-hidden">
              <a
                href={`#${item.toLowerCase()}`}
                data-nav-item
                className="block text-white font-bold leading-[0.88] tracking-[-0.04em] text-[17vw] hover:text-[#f6f44a] transition-colors duration-200"
                onClick={handleNavClick(item.toLowerCase())}
              >
                {item}
              </a>
            </div>
          ))}
        </nav>

        <div className="flex justify-between items-end mt-10">
          <div className="flex flex-col gap-1.5">
            {SOCIAL_LINKS.map(({ label, href }) => (
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
    </div>
  );
}
