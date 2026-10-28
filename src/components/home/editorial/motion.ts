import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
let cleanup: (() => void) | undefined;
export function initializeEditorial() {
  cleanup?.();
  const root = document.querySelector<HTMLElement>(".editorial");
  if (!root) return;
  const media = gsap.matchMedia();
  media.add(
    "(min-width: 600px) and (prefers-reduced-motion: no-preference)",
    () => {
      const gallery = root.querySelector<HTMLElement>(".ed-projects");
      const firstImage = gallery?.querySelector<HTMLElement>(".ed-project-image");
      if (!gallery || !firstImage) return;

      const projects = gallery.querySelectorAll<HTMLElement>(".ed-project");
      // Measure on setup/refresh only; scroll frames only update transforms.
      const travel = () => {
        const style = getComputedStyle(gallery);
        const width = Array.from(projects).reduce((sum, project) => sum + project.offsetWidth, 0);
        return Math.max(0, width + parseFloat(style.columnGap) * (projects.length - 1)
          + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) - gallery.clientWidth);
      };
      gallery.classList.add("ed-projects--scroll-driven");
      gsap.to(projects, {
        x: () => -travel(),
        ease: "none",
        scrollTrigger: {
          trigger: firstImage,
          start: "top 40%",
          end: () => `+=${Math.max(window.innerHeight * 0.65, travel())}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      return () => gallery.classList.remove("ed-projects--scroll-driven");
    },
    root,
  );
  media.add(
    "(prefers-reduced-motion: no-preference)",
    () => {
      root
        .querySelectorAll<HTMLElement>("[data-ed-reveal]")
        .forEach((element) => {
          gsap.from(element, {
            y: 16,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 94%", once: true },
          });
        });
    },
    root,
  );
  const onToggle = () => ScrollTrigger.refresh();
  root
    .querySelectorAll("details")
    .forEach((item) => item.addEventListener("toggle", onToggle));
  const controller = new AbortController();
  const openInquiry = () => {
    if (location.hash === "#project-inquiry") {
      const inquiry =
        root.querySelector<HTMLDetailsElement>("#project-inquiry");
      if (inquiry) inquiry.open = true;
    }
  };
  root.querySelector('a[href="#project-inquiry"]')?.addEventListener(
    "click",
    () => {
      const inquiry =
        root.querySelector<HTMLDetailsElement>("#project-inquiry");
      if (inquiry) inquiry.open = true;
    },
    { signal: controller.signal },
  );
  window.addEventListener("hashchange", openInquiry, {
    signal: controller.signal,
  });
  openInquiry();
  document.fonts.ready.then(() => {
    if (root.isConnected) ScrollTrigger.refresh();
  });
  cleanup = () => {
    media.revert();
    controller.abort();
    root
      .querySelectorAll("details")
      .forEach((item) => item.removeEventListener("toggle", onToggle));
  };
}
document.addEventListener("astro:before-swap", () => {
  cleanup?.();
  cleanup = undefined;
});
