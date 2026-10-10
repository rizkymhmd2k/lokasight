import { useEffect, useId, useRef } from "react";
import "./animated-eye.css";
import artwork from "./eye-artwork.json";

// Traced from gmn_eye1.png: preserve the original ink edges and pupil placement.
export default function AnimatedEye() {
  const eyeRef = useRef(null);
  const gazeRef = useRef(null);
  const clipId = useId();
  const upperClipId = `${clipId}-upper`;
  const lowerClipId = `${clipId}-lower`;

  useEffect(() => {
    const eye = eyeRef.current;
    const gaze = gazeRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let hasPointer = false;
    let bounds = null;

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      hasPointer = false;
      gaze.style.transform = "translate(0px, 0px)";
    };
    const invalidateBounds = () => { bounds = null; };
    const updateGaze = () => {
      frame = 0;
      if (!hasPointer) return;
      bounds ??= eye.getBoundingClientRect();
      const dx = pointerX - (bounds.left + bounds.width / 2);
      const dy = pointerY - (bounds.top + bounds.height / 2);
      // Bound the gaze to an ellipse, keeping the pupil inside the yellow iris.
      const distance = Math.hypot(dx, dy);
      const strength = Math.min(distance / 240, 1);
      const angle = Math.atan2(dy, dx);
      gaze.style.transform = `translate(${Math.cos(angle) * strength * 5}px, ${Math.sin(angle) * strength * 4}px)`;
    };
    const track = (event) => {
      if (event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      hasPointer = true;
      if (!frame) frame = requestAnimationFrame(updateGaze);
    };
    const sync = () => {
      const active = visible && !document.hidden && !motion.matches;
      eye.dataset.active = String(active);
      window.removeEventListener("pointermove", track);
      if (active) window.addEventListener("pointermove", track, { passive: true });
      else reset();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(eye);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    window.addEventListener("scroll", invalidateBounds, { passive: true });
    window.addEventListener("resize", invalidateBounds);

    return () => {
      observer.disconnect();
      reset();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      document.documentElement.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
      window.removeEventListener("scroll", invalidateBounds);
      window.removeEventListener("resize", invalidateBounds);
      window.removeEventListener("pointermove", track);
    };
  }, []);

  return (
    <svg
      ref={eyeRef}
      className="animated-eye"
      viewBox="0 0 160 116.73"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}><path d={artwork.iris} /></clipPath>
        <clipPath id={upperClipId}><path d="M0 0H160V60H0Z" /></clipPath>
        <clipPath id={lowerClipId}><path d="M0 60H160V117H0Z" /></clipPath>
      </defs>
      <g className="animated-eye__blink">
        <path d={artwork.iris} fill="#ffff00" />
        <g clipPath={`url(#${clipId})`}>
          <g ref={gazeRef} className="animated-eye__gaze">
            <path d={artwork.pupil} fill="#000" fillRule="evenodd" />
          </g>
        </g>
        {/* Flex the original upper/lower ink, keeping their shared seam fixed. */}
        <g className="animated-eye__lash animated-eye__lash--upper">
          <path d={artwork.frame} fill="#000" fillRule="evenodd" clipPath={`url(#${upperClipId})`} />
        </g>
        <g className="animated-eye__lash animated-eye__lash--lower">
          <path d={artwork.frame} fill="#000" fillRule="evenodd" clipPath={`url(#${lowerClipId})`} />
        </g>
      </g>
    </svg>
  );
}
