"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import TextScramble from "../shared/TextScramble.jsx";

const ANIMATION_DURATIONS = {
  CURTAIN: 1.4,
  ITEMS: 0.65,
  MENU_ICON: 0.3,
};
const SCROLL_RETRY_DELAY_MS = 80;
const DARK_BG_THRESHOLD = 0.42;
const NAV_ITEMS = ["Home", "Work", "Services", "About", "Contact"];

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
  const [isBackdropVisible, setIsBackdropVisible] = useState(false);
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

    // Unlocking a fixed body can put the viewport at the target without a
    // native scroll event. Refresh scroll-driven effects such as hero dimming.
    window.dispatchEvent(new Event("scroll"));
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

  const animateToX = useCallback((icon) => {
    gsap.to(icon, {
      rotate: 45,
      duration: ANIMATION_DURATIONS.MENU_ICON,
      ease: "power2.inOut",
    });
  }, []);

  const animateToPlus = useCallback((icon) => {
    gsap.to(icon, {
      rotate: 0,
      duration: ANIMATION_DURATIONS.MENU_ICON,
      ease: "power2.inOut",
    });
  }, []);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const menu = menuRef.current;
    const button = buttonRef.current;
    if (!wrapper || !menu || !button) return;

    const ctx = gsap.context(() => {
      const icon = button.querySelector("[data-menu-icon]");
      const items = menu.querySelectorAll("[data-nav-item]");

      gsap.set(items, { yPercent: 110 });

      tlRef.current = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.inOut" },
        onReverseComplete: () => {
          setIsMenuActive(false);
          setIsBackdropVisible(false);
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

      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
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
    const icon = buttonRef.current.querySelector("[data-menu-icon]");

    if (tlRef.current.progress() === 0 || tlRef.current.reversed()) {
      lockPageScroll();
      setIsButtonVisible(true);
      setIsMenuActive(true);
      setIsBackdropVisible(true);
      animateToX(icon);
      tlRef.current.play();
    } else {
      setIsBackdropVisible(false);
      animateToPlus(icon);
      tlRef.current.reverse();
    }
  }, [animateToPlus, animateToX, lockPageScroll]);

  const handleNavClick = useCallback(
    (sectionId) => (e) => {
      // Remove the backdrop before any scroll/navigation work. This must not
      // depend on the GSAP timeline state, which can already be reversing.
      setIsBackdropVisible(false);

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

  const isDarkBg = !isMenuActive && measuredIsDarkBg;
  const barClass = isDarkBg ? "bg-white" : "bg-black";

  return (
    <div ref={wrapperRef} className="sm:hidden fixed inset-0 z-[60] pointer-events-none">
      {isBackdropVisible && (
        <div aria-hidden="true" className="fixed inset-0 z-[64] bg-black/15" />
      )}
      <div className="fixed top-4 right-4 z-[70] pointer-events-auto">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          aria-label={isMenuActive ? "Close menu" : "Open menu"}
          aria-expanded={isMenuActive}
          aria-controls="mobile-curtain-menu"
          className={[
            "grid h-10 w-10 place-items-center",
            "transition-[transform,opacity] duration-200 ease-out",
            isButtonVisible || isMenuActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none",
          ].join(" ")}
        >
          <span data-menu-icon className="relative block h-6 w-6" aria-hidden="true">
            <span className={`absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 ${barClass} transition-colors duration-200`} />
            <span className={`absolute left-1/2 top-0 block h-6 w-0.5 -translate-x-1/2 ${barClass} transition-colors duration-200`} />
          </span>
        </button>
      </div>

      <div
        id="mobile-curtain-menu"
        ref={menuRef}
        data-lenis-prevent
        className="fixed inset-0 z-[65] flex flex-col overflow-y-auto overscroll-contain bg-backgroundlight px-4 pb-3 pt-4 text-black"
        style={{ pointerEvents: isMenuActive ? "auto" : "none" }}
        onClick={(e) => {
          if (e.target === e.currentTarget && isMenuActive) toggleMenu();
        }}
      >
        <div className="flex min-h-10 items-center gap-3 pr-12">
          <img
            src="/gmn_eye.png"
            alt=""
            aria-hidden="true"
            className="h-8 w-11 shrink-0 object-contain"
          />
          <span className="text-lg font-bold tracking-[-0.04em]">Lokasight</span>
        </div>

        <nav className="mt-3 flex flex-col border-t border-black/55" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <div key={item} className="overflow-hidden border-b border-black/55">
              <a
                href={`#${item.toLowerCase()}`}
                data-nav-item
                aria-label={item}
                className="block py-[0.18rem] text-[clamp(2.75rem,13vw,5rem)] font-semibold leading-[0.92] tracking-[-0.055em] transition-colors duration-200 hover:text-yellow1"
                onClick={handleNavClick(item.toLowerCase())}
              >
                <TextScramble>{item}</TextScramble>
              </a>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <div className="border-b border-black/55 pb-2">
            <a
              href="mailto:hello@lokasight.com"
              className="text-sm font-semibold tracking-[-0.02em] transition-colors hover:text-yellow1"
            >
              hello@lokasight.com
            </a>
          </div>
          <span className="block w-full whitespace-nowrap pt-4 font-oswald text-[18.5vw] leading-[0.83] tracking-[-0.055em]">
            LOKASIGHT
          </span>
        </div>
      </div>
    </div>
  );
}
