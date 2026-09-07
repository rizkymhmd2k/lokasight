"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: "Strategy",
    imageKey: "strategy",
    imageAlt: "Strategy service visual",
    tags: [
      "Research",
      "Positioning",
      "Audience",
      "Messaging",
    ],
    desc: "Understanding where your business stands today, where it belongs tomorrow, and how to close the gap with clarity.",
  },
  {
    title: "Identity",
    imageKey: "identity",
    imageAlt: "Identity service visual",
    tags: [
      "Visual Identity",
      "Verbal Identity",
      "Art Direction",
      "Design System",
      "Guidelines",
    ],
    desc: "Creating identities that feel distinct, consistent, and built to last across every touchpoint.",
  },
  {
    title: "Digital",
    imageKey: "digital",
    imageAlt: "Digital service visual",
    tags: [
      "Websites",
      "Content",
      "Performance",
      "SEO",
      "Analytics",
      "Growth",
    ],
    desc: "Turning strategy into digital experiences that build trust and support long-term growth.",
  },
];

function YellowDot() {
  return <span className="h-1 w-1 shrink-0 rounded-full bg-[#FFFF04]" />;
}

function ServiceImage({ src, alt, className = "" }) {
  return (
    <div
      className={`relative isolate aspect-video w-full overflow-hidden rounded-lg bg-[#F9F8EF] md:aspect-[4/3] ${className}`}
    >
      <img
        src={src.src}
        srcSet={src.srcSet}
        alt={alt}
        width={src.width}
        height={src.height}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function Tags({ tags, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[11px] px-3 py-1 rounded-full bg-white/10 text-white/60 border border-white/10"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function ServiceItem({ item, isFirst, isLast, image }) {
  return (
    <div
      className={`group w-full border-white/20 ${isFirst ? "border-t" : ""} ${isLast ? "" : "border-b"}`}
    >
      <div
        className="
          grid grid-cols-1 gap-4 pb-14 pt-6
          md:gap-x-10 md:gap-y-6 md:grid-cols-[minmax(0,1fr)_240px]
          xl:grid-cols-[220px_minmax(0,1fr)_240px]
          items-start content-start
        "
      >
        <div className="order-1 md:col-start-1 md:row-start-1 xl:col-start-1 xl:row-start-1">
          <div className="flex items-center gap-3">
            <YellowDot />
            <h3 className="text-white text-2xl lg:text-3xl font-semibold">
              {item.title}
            </h3>
          </div>
        </div>

        <Tags
          tags={item.tags}
          className="order-2 mt-1 md:mt-3 md:col-start-1 md:row-start-2 xl:mt-0 xl:col-start-2 xl:row-start-2"
        />

        <p
          className="
            order-3 mt-3
            text-white/80 md:text-white/60
            text-sm leading-relaxed
            md:order-2 md:mt-0 md:col-start-1 md:row-start-3
            xl:col-start-2 xl:row-start-1 2xl:max-w-90
          "
        >
          {item.desc}
        </p>

        <div
          className="
            order-4 mt-2 w-[70%] justify-self-start
            md:order-3 md:mt-0 md:w-[240px] md:justify-self-end md:col-start-2 md:row-start-1 md:row-span-3
            xl:col-start-3 xl:row-start-1
          "
        >
          <ServiceImage
            src={image}
            alt={item.imageAlt}
            className="w-full md:w-[240px]"
          />
        </div>
      </div>
    </div>
  );
}

const Services = ({ serviceImages }) => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);

  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    let disposed = false;
    const fitHeading = () => {
      if (disposed) return;
      const words = heading.querySelectorAll("[data-services-heading-word]");
      const styles = getComputedStyle(heading);
      const textWidth = Array.from(words).reduce(
        (width, word) => width + word.getBoundingClientRect().width,
        0,
      );
      const availableWidth =
        heading.clientWidth - parseFloat(styles.columnGap) * (words.length - 1);
      if (textWidth > 0 && availableWidth > 0) {
        heading.style.fontSize = `${parseFloat(styles.fontSize) * availableWidth / textWidth}px`;
      }
    };

    const observer = new ResizeObserver(fitHeading);
    observer.observe(heading.parentElement);
    document.fonts.ready.then(fitHeading);
    fitHeading();

    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    if (!section || !heading) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const words = heading.querySelectorAll("[data-services-heading-word]");
      if (!words.length) return;

      if (prefersReducedMotion) {
        gsap.set(words, { yPercent: 0, opacity: 1, clearProps: "transform" });
        return;
      }

      const mm = gsap.matchMedia();
      const makeTimeline = (startValue) => {
        gsap
          .timeline({
            defaults: { ease: "power4.inOut" },
            scrollTrigger: {
              trigger: section,
              start: startValue,
              toggleActions: "play none none reverse",
            },
          })
          .fromTo(
            words,
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.65,
              stagger: 0.23,
              ease: "power3.out",
            },
          );
      };

      // Tailwind-aligned breakpoints:
      // base: <640, sm: 640-767, md: 768-1023, lg: 1024-1279, xl: 1280-1535, 2xl: >=1536
      mm.add("(max-width: 639px)", () => makeTimeline("top 90%")); // base
      mm.add(
        "(min-width: 640px) and (max-width: 767px)",
        () => makeTimeline("top 78%"), // sm
      );
      mm.add(
        "(min-width: 768px) and (max-width: 1023px)",
        () => makeTimeline("top 90%"), // md
      );
      mm.add(
        "(min-width: 1024px) and (max-width: 1279px)",
        () => makeTimeline("top 50%"), // lg
      );
      mm.add(
        "(min-width: 1280px) and (max-width: 1535px)",
        () => makeTimeline("top 58%"), // xl
      );
      mm.add("(min-width: 1536px)", () => makeTimeline("top 46%")); // 2xl

      ScrollTrigger.refresh();
      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div
      id="services"
      ref={sectionRef}
      className="w-full px-2 sm:px-4 pt-12 sm:pt-24 flex flex-col bg-backgroundlight"
    >
      <div className="flex w-full flex-col overflow-hidden rounded-3xl bg-black">
        {/* HEADER */}
        <div className="flex w-full flex-col justify-start p-6 md:p-10">
          <span className="text-sm md:text-xl font-medium text-white">
            [SERVICES]
          </span>

          <div className="flex w-full md:mt-10">
            <h2
              ref={headingRef}
              className="flex flex-row justify-between max-md:pt-6 w-full gap-1 md:gap-2 mb-0 md:mb-5 text-[5.5vw] md:text-[clamp(1.5rem,8vw,68rem)] font-bold leading-[0.95] tracking-[-0.04em] text-white"
              aria-label="DEFINE. DESIGN. DELIVER."
            >
              {["DEFINE.", "DESIGN.", "DELIVER."].map((word) => (
                <React.Fragment key={word}>
                  <span className="inline-block shrink-0 overflow-hidden whitespace-nowrap align-bottom py-[0.12em]">
                    <span
                      data-services-heading-word
                      className="inline-block will-change-transform"
                    >
                      {word}
                    </span>
                  </span>
                </React.Fragment>
              ))}
            </h2>
          </div>
        </div>

        {/* SERVICES */}
        <div className="grid w-full grid-cols-1 px-6 pb-6 md:px-10 md:pb-10 lg:grid-cols-12">
          <div className="flex w-full flex-col lg:col-span-8 lg:col-start-5">
          {/* <div className="border-t border-white/10 mb-6 md:hidden" /> */}

          {services.map((item, idx) => (
            <ServiceItem
              key={idx}
              item={item}
              image={serviceImages[item.imageKey]}
              isFirst={idx === 0}
              isLast={idx === services.length - 1}
            />
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
