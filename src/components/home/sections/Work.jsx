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

function Graphic({ type, space = true }) {
  return (
    <>
      <span className={`work-heading__graphic work-heading__graphic--${type}`} aria-hidden="true">
        <span data-work-graphic className="work-heading__graphic-inner">
          {type === "eye" ? <AnimatedEye /> : <svg viewBox={type === "type" ? "0 0 128 96" : "0 0 160 100"} fill="none" focusable="false">
            {type === "spark" && <g fill="currentColor">
              <path d="M58 1C56 34 46 43 9 47c34 3 45 12 46 46 6-33 14-43 48-46C72 42 61 34 58 1Z" />
              <path d="M119 39c-3 21-10 29-33 32 22 3 29 10 31 28 4-19 11-26 34-29-23-3-29-9-32-31Z" />
            </g>}
            {type === "orbit" && <g stroke="currentColor" strokeWidth="1.7">
              <ellipse cx="80" cy="50" rx="75" ry="28" />
              <ellipse cx="80" cy="50" rx="50" ry="28" />
              <ellipse cx="80" cy="50" rx="20" ry="28" />
              <ellipse cx="80" cy="50" rx="11" ry="28" />
              <path d="M5 50h150" />
            </g>}
            {type === "type" && <g>
              <path d="M2 2h124v92H2z" fill="#ffff04" stroke="currentColor" strokeWidth="2.5" />
              <text x="10" y="76" fill="currentColor" fontFamily="Arial, Helvetica, sans-serif" fontSize="78" letterSpacing="-7">Aa</text>
              <path d="M115 14v68" stroke="currentColor" strokeWidth="3" />
            </g>}
          </svg>}
        </span>
      </span>{space && " "}
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

  useLayoutEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;

    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const copy = gsap.utils.toArray("[data-work-copy]", root);
        const graphics = gsap.utils.toArray("[data-work-graphic]", root);
        const loops = [];
        let entered = false;
        let visible = false;
        const syncMotion = () => {
          loops.forEach((animation) => animation.paused(!entered || !visible || document.hidden));
        };

        if (graphics.length) {
          const sparks = root.querySelectorAll(".work-heading__graphic--spark path");
          sparks.forEach((spark, index) => {
            loops.push(gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.5 + index * 0.4 })
              .to(spark, {
                scale: 0.65, rotation: -18, transformOrigin: "50% 50%",
                duration: 0.4, ease: "sine.inOut", delay: index * 0.3,
              })
              .to(spark, { scale: 1.08, rotation: 12, duration: 0.55, ease: "back.out(2)" })
              .to(spark, { scale: 1, rotation: 0, duration: 0.45, ease: "sine.inOut" }));
          });

          loops.push(gsap.fromTo(root.querySelector(".work-heading__graphic--orbit svg"),
            { rotation: -9 },
            { rotation: 9, transformOrigin: "50% 50%", duration: 2.4,
              repeat: -1, yoyo: true, ease: "sine.inOut", paused: true }));
          loops.push(gsap.fromTo(root.querySelectorAll(".work-heading__graphic--orbit ellipse:not(:first-child)"),
            { scaleX: 0.7 },
            { scaleX: 1.15, transformOrigin: "50% 50%", duration: 1.8, stagger: 0.2,
              repeat: -1, yoyo: true, ease: "sine.inOut", paused: true }));

          loops.push(gsap.fromTo(root.querySelector(".work-heading__graphic--type svg"),
            { yPercent: -5 },
            { yPercent: 5, duration: 1.8,
              repeat: -1, yoyo: true, ease: "sine.inOut", paused: true }));

          ScrollTrigger.create({
            trigger: root, start: "top bottom", end: "bottom top",
            onToggle: (trigger) => { visible = trigger.isActive; syncMotion(); },
            onRefresh: (trigger) => { visible = trigger.isActive; syncMotion(); },
          });
          document.addEventListener("visibilitychange", syncMotion);
        }

        const timeline = gsap.timeline({
          defaults: { ease: "power4.out" },
          onComplete: () => { entered = true; syncMotion(); },
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

        if (graphics.length) {
          timeline.fromTo(
            graphics,
            {
              autoAlpha: 0,
              y: 8,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              stagger: 0.12,
            },
            0.14,
          );
        }

        return () => document.removeEventListener("visibilitychange", syncMotion);
      });
    }, root);

    return () => {
      media.revert();
      ctx.revert();
    };
  }, [embedded, label, text]);

  const headingClassName = `work-heading${embedded ? " work-heading--embedded" : ""}`;

  return (
    <div
      id={embedded ? undefined : "work"}
      className={
        embedded
          ? "flex flex-col text-white"
          : "bg-backgroundlight px-page pt-section"
      }
    >
      <div ref={wrapperRef} className="relative">
        {embedded ? (
          <h2 className={headingClassName} aria-label={`${label} ${text}`}>
            <span className="work-heading__label">{label}</span>{" "}
            {words.map((word, index) => {
              if (word === "distinctive" && words[index + 1] === "brands") {
                return (
                  <React.Fragment key={`${word}-${index}`}>
                    <span className="work-heading__phrase" data-work-copy>
                      <em className="work-heading__highlight">{word}</em> brands
                    </span>{" "}
                  </React.Fragment>
                );
              }

              if (word === "brands" && words[index - 1] === "distinctive") return null;
              return <Word key={`${word}-${index}`}>{word}</Word>;
            })}
          </h2>
        ) : (
          <h2 className={headingClassName} aria-label={`${label} ${text}`}>
            <span className="work-heading__label">{label}</span>{" "}
            <Word>Attention</Word>
            <Graphic type="spark" />
            <Word>fades.</Word>
            <Word>We</Word>
            <Word>build</Word>
            <Graphic type="orbit" />
            <span className="work-heading__phrase" data-work-copy>
              <em className="work-heading__highlight">distinctive</em> brands
            </span>{" "}
            <Word>that</Word>
            <Word>make</Word>
            <Word>a</Word>
            <Word>lasting</Word>
            <Word>impression.</Word>
            <Word>The</Word>
            <Word>kind</Word>
            <Word>you</Word>
            <Word>know</Word>
            <Word>from</Word>
            <Word>one</Word>
            <Word>corner</Word>
            <Word>of</Word>
            <Word>a</Word>
            <Word>poster,</Word>
            <Word>one</Word>
            <Word>word</Word>
            <Word>in</Word>
            <Word>a</Word>
            <span className="work-heading__punctuated">
              <Word>headline</Word>
              <Graphic type="type" space={false} />,
            </span>{" "}
            <Word>one</Word>
            <Word>glimpse</Word>
            <Graphic type="eye" />
            <Word>across</Word>
            <Word>the</Word>
            <Word>street.</Word>
          </h2>
        )}
      </div>
    </div>
  );
};

export default Work;
