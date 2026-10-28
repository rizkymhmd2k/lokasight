"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import AnimatedEye from "../../shared/AnimatedEye.jsx";
import "./work.css";

gsap.registerPlugin(ScrollTrigger);

function Word({ children }) {
  return (
    <>
      <span className="work-heading__word-mask">
        <span data-work-copy className="work-heading__word">
          {children}
        </span>
      </span>{" "}
    </>
  );
}

function ServiceGraphic({ growth = false }) {
  return (
    <span data-work-copy className="work-heading__graphic" aria-hidden="true">
      <svg viewBox="0 0 106 104" fill="none" focusable="false">
        {growth ? (
          <>
            <circle cx="53" cy="52" r="49" fill="currentColor" />
            <path className="work-heading__growth-arrow" d="M32 73 74 31M34 31h40v40" stroke="#080808" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <g className="work-heading__rings" stroke="currentColor" strokeWidth="7">
            <ellipse cx="53" cy="52" rx="43" ry="22" transform="rotate(-45 53 52)" />
            <ellipse cx="53" cy="52" rx="43" ry="22" transform="rotate(45 53 52)" />
          </g>
        )}
      </svg>
    </span>
  );
}

const Work = ({
  embedded = false,
  text = "We help ambitious businesses become distinctive brands that leave a lasting impression.",
}) => {
  const wrapperRef = useRef(null);
  const words = text.trim().split(/\s+/);
  const eyeWordIndex = words.indexOf("glimpse");
  const ringsWordIndex = words.indexOf("growth.");
  const growthWordIndex = words.indexOf("trust");

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
  }, [embedded, text]);

  const headingClassName = embedded
    ? "work-heading work-heading--intro work-heading--embedded"
    : "work-heading work-heading--intro";

  return (
    <div
      id={embedded ? undefined : "work"}
      className={
        embedded
          ? "flex flex-col text-white"
          : "work-intro px-page"
      }
    >
      <div ref={wrapperRef} className="relative">
        {!embedded && (
          <div className="work-welcome">
            <p data-work-copy className="work-welcome__label">Hi There</p>
            <h2 data-work-copy className="work-welcome__title">
              Welcome to<br />our studio!
            </h2>
            <p data-work-copy className="work-welcome__copy">{text}</p>
          </div>
        )}
        {embedded && <h2 className={headingClassName} aria-label={text}>
          {words.map((word, index) => (
            <React.Fragment key={`${word}-${index}`}>
              <Word>
                {embedded && index === ringsWordIndex ? (
                  <>
                    {word.slice(0, -1)}<ServiceGraphic />.
                  </>
                ) : word}
              </Word>
              {embedded && index === growthWordIndex && (
                <>
                  <ServiceGraphic growth />{" "}
                </>
              )}
              {!embedded && index === eyeWordIndex && (
                <>
                  <span data-work-copy className="work-heading__eye" aria-hidden="true">
                    <AnimatedEye />
                  </span>{" "}
                </>
              )}
            </React.Fragment>
          ))}
        </h2>}
      </div>
    </div>
  );
};

export default Work;
