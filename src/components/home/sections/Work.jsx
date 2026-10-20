"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import AnimatedEye from "../../shared/AnimatedEye.jsx";
import "./work.css";

gsap.registerPlugin(ScrollTrigger);

function Word({ children, muted = false }) {
  return (
    <>
      <span className="work-heading__word-mask">
        <span data-work-copy className={`work-heading__word${muted ? " work-heading__word--muted" : ""}`}>
          {children}
        </span>
      </span>{" "}
    </>
  );
}

const Work = ({
  embedded = false,
  label = "[WORK]",
  text = "Attention fades. We build distinctive brands that make a lasting impression. The kind you know from one corner of a poster, one word in a headline, one glimpse across the street.",
}) => {
  const wrapperRef = useRef(null);
  const words = text.trim().split(/\s+/);
  const openingSentenceEnd = words.findIndex((word) => /[.!?]$/.test(word));
  const eyeWordIndex = words.indexOf("glimpse");

  useLayoutEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;

    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const copy = gsap.utils.toArray("[data-work-copy]", root);
        const timeline = gsap.timeline({
          defaults: { ease: "power4.out" },
          scrollTrigger: {
            trigger: root,
            start: "top 76%",
            once: true,
          },
        });

        timeline.fromTo(
          copy,
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.012 },
        );
      });
    }, root);

    return () => {
      media.revert();
      ctx.revert();
    };
  }, [embedded, label, text]);

  const headingClassName = `work-heading work-heading--compact${embedded ? " work-heading--embedded" : ""}`;

  return (
    <div
      id={embedded ? undefined : "work"}
      className={
        embedded
          ? "flex flex-col text-white"
          : "work-intro bg-backgroundlight px-page"
      }
    >
      <div ref={wrapperRef} className="relative">
        <h2 className={headingClassName} aria-label={`${label} ${text}`}>
          <span className="work-heading__label">{label}</span>{" "}
          {words.map((word, index) => (
            <React.Fragment key={`${word}-${index}`}>
              <Word muted={openingSentenceEnd >= 0 && index > openingSentenceEnd}>
                {word}
              </Word>
              {!embedded && index === eyeWordIndex && (
                <>
                  <span data-work-copy className="work-heading__eye" aria-hidden="true">
                    <AnimatedEye />
                  </span>{" "}
                </>
              )}
            </React.Fragment>
          ))}
        </h2>
      </div>
    </div>
  );
};

export default Work;
