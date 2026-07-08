"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: "Strategy",
    mockup: "strategy",
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
    mockup: "digital",
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
    mockup: "development",
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

function PingDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className="
          absolute inline-flex h-full w-full rounded-full
          bg-red-500
          opacity-0
          group-hover:opacity-60
          group-hover:animate-ping
          motion-reduce:group-hover:animate-none
        "
      />
      <span
        className="
          relative inline-flex h-2 w-2 rounded-full
          bg-red-500
          opacity-40
          transition-all duration-300 ease-out
          group-hover:opacity-100
          group-hover:shadow-[0_0_10px_rgba(239,68,68,0.85)]
        "
      />
    </span>
  );
}

function MockupFrame({ children, className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`relative isolate aspect-square w-full overflow-hidden rounded-lg border border-black/10 bg-[#dca92e] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#efcc58_0%,#dca92e_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.14),transparent_34%,rgba(0,0,0,0.06)_100%)]" />
      <div className="absolute inset-[10px] rounded-md border border-white/20" />
      <div className="absolute inset-x-5 top-5 h-px bg-white/25" />
      <div className="absolute inset-y-5 right-5 w-px bg-black/10" />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

function EditorialSheet({ children, className = "" }) {
  return (
    <div
      className={`absolute overflow-hidden rounded-sm border border-black/10 bg-[#fbf7ea] shadow-[0_18px_38px_rgba(74,50,0,0.18)] ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(246,239,223,0.9))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/80" />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

function StrategyMockup() {
  return (
    <>
      <EditorialSheet className="left-3 top-3 right-[34%] h-[88px] -rotate-1 p-3 transition-transform duration-500 group-hover:-translate-y-1 lg:left-4 lg:top-6 lg:right-auto lg:h-[76px] lg:w-[74px] lg:-rotate-3">
        <div className="text-[7px] uppercase tracking-[0.22em] text-black/45">
          Research
        </div>
        <div className="mt-3 font-serif text-[19px] leading-[0.88] tracking-[-0.05em] text-black">
          Market
        </div>
        <div className="mt-2 h-px w-10 bg-black/10" />
        <div className="mt-2 space-y-1">
          <div className="h-px w-10 bg-black/10" />
          <div className="h-px w-8 bg-black/10" />
        </div>
      </EditorialSheet>

      <EditorialSheet className="left-[42%] right-3 top-3 bottom-14 rotate-1 p-3 transition-transform duration-500 group-hover:-translate-y-1 lg:left-auto lg:right-4 lg:top-4 lg:bottom-4 lg:w-[102px] lg:rotate-2 lg:p-3.5">
        <div className="flex items-center justify-between text-[7px] uppercase tracking-[0.22em] text-black/40">
          <span>01</span>
          <span>Positioning</span>
        </div>
        <div className="mt-4 font-serif text-[22px] leading-[0.86] tracking-[-0.05em] text-black">
          Strategy
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-px w-16 bg-black/10" />
          <div className="h-px w-12 bg-black/10" />
          <div className="h-px w-14 bg-black/10" />
        </div>
        <div className="absolute inset-x-3 bottom-3 top-[82px] border border-black/10 p-2">
          <div className="relative h-full w-full">
            <div className="absolute inset-y-1 left-1/2 w-px -translate-x-1/2 bg-black/10" />
            <div className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-black/10" />
            <div className="absolute left-[60%] top-[34%] h-2 w-2 bg-red-500" />
            <div className="absolute right-1 bottom-1 text-[6px] uppercase tracking-[0.18em] text-black/35">
              Insight
            </div>
          </div>
        </div>
      </EditorialSheet>

      <div className="absolute left-4 bottom-4 h-10 w-[44%] border-t border-black/10 pt-2 text-[7px] uppercase tracking-[0.22em] text-black/40 lg:hidden">
        Audience fit
      </div>
      <div className="absolute left-[84px] top-[72px] hidden h-px w-10 bg-black/10 lg:block" />
      <div className="absolute left-[124px] top-[72px] hidden h-1.5 w-1.5 bg-red-500 lg:block" />
    </>
  );
}

function DigitalExperienceMockup() {
  return (
    <>
      <EditorialSheet className="left-3 top-3 right-3 h-[102px] p-3 transition-transform duration-500 group-hover:-translate-y-1 lg:left-4 lg:top-4 lg:bottom-4 lg:right-auto lg:h-auto lg:w-[108px] lg:p-3.5">
        <div className="flex items-center justify-between text-[7px] uppercase tracking-[0.22em] text-black/40">
          <span>02</span>
          <span>Identity</span>
        </div>
        <div className="mt-3 border border-black/10 bg-[#1d1d1d] p-2">
          <div className="h-8 bg-[radial-gradient(circle_at_60%_40%,rgba(247,208,77,0.9),rgba(182,118,10,0.35)_48%,rgba(18,18,18,0)_50%)]" />
        </div>
        <div className="mt-3 font-serif text-[20px] leading-[0.88] tracking-[-0.05em] text-black">
          Systems
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="h-px w-10 bg-black/10" />
            <div className="h-px w-8 bg-black/10" />
            <div className="h-px w-9 bg-black/10" />
          </div>
          <div className="space-y-1">
            <div className="h-px w-9 bg-black/10" />
            <div className="h-px w-11 bg-black/10" />
            <div className="h-px w-7 bg-black/10" />
          </div>
        </div>
      </EditorialSheet>

      <EditorialSheet className="left-3 bottom-3 h-[64px] w-[34%] p-2.5 transition-transform duration-500 group-hover:-translate-y-1 lg:left-auto lg:right-4 lg:top-6 lg:bottom-auto lg:h-[94px] lg:w-[52px] lg:-rotate-2">
        <div className="text-[6px] uppercase tracking-[0.22em] text-black/35">
          Voice
        </div>
        <div className="mt-3 h-[42px] border border-black/10 bg-[#f0c23f]" />
        <div className="mt-3 h-px w-full bg-black/10" />
        <div className="mt-2 space-y-1">
          <div className="h-px w-7 bg-black/10" />
          <div className="h-px w-6 bg-black/10" />
        </div>
      </EditorialSheet>

      <EditorialSheet className="left-[38%] right-3 bottom-3 h-[64px] px-3 py-2 transition-transform duration-500 group-hover:translate-y-1 lg:left-[92px] lg:right-4 lg:bottom-4 lg:h-10">
        <div className="text-[7px] uppercase tracking-[0.22em] text-black/45">
          Direction
        </div>
        <div className="mt-2 h-px w-14 bg-black/10" />
        <div className="mt-2 space-y-1 lg:hidden">
          <div className="h-px w-16 bg-black/10" />
          <div className="h-px w-10 bg-black/10" />
        </div>
      </EditorialSheet>
    </>
  );
}

function CreativeDevelopmentMockup() {
  return (
    <>
      <EditorialSheet className="left-3 right-3 top-3 h-[96px] p-3 transition-transform duration-500 group-hover:-translate-y-1 lg:left-4 lg:right-4 lg:top-4 lg:h-[86px] lg:p-3.5">
        <div className="flex items-center justify-between text-[7px] uppercase tracking-[0.22em] text-black/40">
          <span>03</span>
          <span>Launch</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="h-10 bg-[#1d1d1d]" />
          <div className="h-10 border border-black/10 bg-[#efe5cc]" />
          <div className="relative h-10 bg-[#1d1d1d]">
            <div className="absolute inset-2 border border-[#f0c23f]/60" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-black/10" />
          <div className="text-[6px] uppercase tracking-[0.2em] text-black/35">
            Measure
          </div>
        </div>
      </EditorialSheet>

      <EditorialSheet className="left-3 bottom-3 h-[74px] w-[46%] p-3 transition-transform duration-500 group-hover:-translate-y-1 lg:left-5 lg:bottom-4 lg:h-[62px] lg:w-[92px] lg:-rotate-2">
        <div className="text-[7px] uppercase tracking-[0.22em] text-black/45">
          Scale
        </div>
        <div className="mt-1 font-serif text-[20px] leading-none tracking-[-0.04em] text-black">
          Scale
        </div>
        <div className="mt-2 space-y-1">
          <div className="h-px w-11 bg-black/10" />
          <div className="h-px w-14 bg-black/10" />
        </div>
      </EditorialSheet>

      <EditorialSheet className="right-3 bottom-3 h-[74px] w-[34%] p-2.5 transition-transform duration-500 group-hover:translate-y-1 lg:right-4 lg:bottom-5 lg:h-[66px] lg:w-[56px] lg:rotate-3">
        <div className="text-[6px] uppercase tracking-[0.22em] text-black/35">
          Refine
        </div>
        <div className="mt-2 h-px w-full bg-black/10" />
        <div className="mt-2 grid grid-cols-2 gap-1">
          <div className="h-4 bg-black/10" />
          <div className="h-4 bg-[#e8bb3b]" />
          <div className="h-4 bg-[#efe5cc]" />
          <div className="h-4 bg-black/10" />
        </div>
        <div className="mt-2 h-px w-6 bg-red-400/80" />
      </EditorialSheet>
    </>
  );
}

function ServiceVisualCard({ variant, className = "" }) {
  let content = <StrategyMockup />;

  if (variant === "digital") {
    content = <DigitalExperienceMockup />;
  } else if (variant === "development") {
    content = <CreativeDevelopmentMockup />;
  }

  return <MockupFrame className={className}>{content}</MockupFrame>;
}

function StatCard({ variant, className = "" }) {
  return <ServiceVisualCard variant={variant} className={className} />;
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

function ServiceItem({ item, isLast }) {
  return (
    <div className="group w-full">
      <div
        className="
          grid grid-cols-1 gap-4
          md:pt-6 md:gap-x-10 md:gap-y-6 md:grid-cols-[minmax(0,1fr)_180px]
          xl:grid-cols-[220px_minmax(0,1fr)_180px]
          items-start content-start
        "
      >
        <div className="order-1 md:col-start-1 md:row-start-1 xl:col-start-1 xl:row-start-1">
          <div className="flex items-center gap-3">
            <PingDot />
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
            order-4 mt-2 w-full
            md:order-3 md:mt-0 md:w-[180px] md:justify-self-end md:col-start-2 md:row-start-1 md:row-span-3
            xl:col-start-3 xl:row-start-1
          "
        >
          <StatCard variant={item.mockup} className="w-full md:w-[180px]" />
        </div>
      </div>

      {/* DIVIDER */}
      {!isLast && <div className="mt-8 lg:mt-10 border-t border-white/10" />}
    </div>
  );
}

const Services = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);

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
      <div className="bg-black w-full rounded-3xl overflow-hidden flex flex-col md:flex-row">
        {/* LEFT MAIN */}
        <div className="w-full md:w-2/5 2xl:w-3/5 flex flex-col justify-start p-6 md:p-10  ">
          <span className="text-sm md:text-xl font-medium text-white">
            [SERVICES]
          </span>

          <div className="flex-1 flex md:mt-10">
            <h1
              ref={headingRef}
              className="text-white text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-8xl font-bold tracking-[-0.04em] pt-6 md:pt-8 leading-[0.95]"
              aria-label="STRATEGY. IDENTITY. DIGITAL."
            >
              {["STRATEGY.", "IDENTITY.", "DIGITAL."].map((word, index, all) => (
                <React.Fragment key={word}>
                  <span className="inline-block overflow-hidden align-bottom">
                    <span
                      data-services-heading-word
                      className="inline-block will-change-transform"
                    >
                      {word}
                    </span>
                  </span>
                  {index < all.length - 1 ? " " : null}
                </React.Fragment>
              ))}
            </h1>
          </div>
        </div>

        {/* RIGHT SERVICES */}
        <div className="w-full p-6 md:p-10 flex flex-col">
          <div className="border-t border-white/10 mb-6 md:hidden" />

          {services.map((item, idx) => (
            <ServiceItem
              key={idx}
              item={item}
              isLast={idx === services.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
