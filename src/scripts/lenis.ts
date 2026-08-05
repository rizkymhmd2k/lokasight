import Lenis from "lenis";

declare global {
  interface Window {
    lenis?: Lenis;
    __lenisCleanup?: () => void;
  }
}

export function initializeLenis() {
  if (typeof window === "undefined" || window.__lenisCleanup) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let resumeFrame = 0;

  const createLenis = () => {
    if (reducedMotion.matches || window.lenis) return;

    window.lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.08,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });
  };

  const destroyLenis = () => {
    window.lenis?.destroy();
    delete window.lenis;
  };

  const resumeLenis = () => {
    if (reducedMotion.matches) return;

    window.cancelAnimationFrame(resumeFrame);
    resumeFrame = window.requestAnimationFrame(() => {
      createLenis();
      window.lenis?.resize();
      window.lenis?.start();
    });
  };

  const onMotionChange = () => {
    if (reducedMotion.matches) destroyLenis();
    else resumeLenis();
  };
  const onBeforePreparation = () => window.lenis?.stop();
  const onAfterSwap = () => resumeLenis();
  const onPageHide = (event: PageTransitionEvent) => {
    if (event.persisted) window.lenis?.stop();
    else cleanup();
  };
  const onPageShow = (event: PageTransitionEvent) => {
    if (event.persisted) resumeLenis();
  };

  const cleanup = () => {
    window.cancelAnimationFrame(resumeFrame);
    reducedMotion.removeEventListener("change", onMotionChange);
    document.removeEventListener("astro:before-preparation", onBeforePreparation);
    document.removeEventListener("astro:after-swap", onAfterSwap);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("pageshow", onPageShow);
    destroyLenis();
    delete window.__lenisCleanup;
  };

  window.__lenisCleanup = cleanup;
  reducedMotion.addEventListener("change", onMotionChange);
  document.addEventListener("astro:before-preparation", onBeforePreparation);
  document.addEventListener("astro:after-swap", onAfterSwap);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("pageshow", onPageShow);
  resumeLenis();
}
