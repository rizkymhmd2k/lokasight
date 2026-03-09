"use client";

import React, { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: "Brand Strategy",
    tags: [
      "Research & Insights",
      "Positioning",
      "Competitive Analysis",
      "Messaging",
    ],
    desc: "Defining brand strategy that sharpens market positioning, strengthens perception, and creates stronger customer preference in competitive spaces.",
    stat: "",
    image: "/brand.webp",

  },
  {
    title: "Digital Experience",
    tags: [
      "Identity Systems",
      "Wireframing",
      "UI Design",
      "UX Design",
      "Web Design",
      "Product Design",
    ],
    desc: "Designing digital experiences that elevate brand perception, improve usability, and create clearer paths to engagement and conversion.",
    stat: "",
    image: "/design2.webp",
  },
  {
    title: "Creative Development",
    tags: [
      "Frontend Development",
      "CMS Integration",
      "Motion Design",
      "Interactive Experiences",
      "3D",
      "WebGL",
      "Technical SEO",
    ],
    desc: "Developing high-performing digital experiences that bring strategy and design to life with precision, scalability, and seamless execution.",
    stat: "",
    image: "/development.webp",
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

function StatCard({ stat, image, title, className = "" }) {
  return (
    <div
      className={`relative h-[180px] w-full overflow-hidden rounded-2xl bg-white sm:h-[220px] lg:h-[180px] ${className}`}
    >
      {image ? (
        <>
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 1023px) 100vw, 180px"
            className="object-contain will-change-transform"
            data-service-image
          />
          <div className="absolute inset-0 bg-white/10" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white via-yellow-200 to-yellow-400 opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-200/40 to-transparent" />
        </>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 text-black/70 font-medium">
          <span className="text-sm">{stat}</span>
          {/* <span className="text-sm">→</span> */}
        </div>
      </div>
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

function ServiceItem({ item, isLast }) {
  return (
    <div className="group w-full">
      <div
        className="
          grid grid-cols-1 gap-4
          lg:pt-6 lg:gap-x-10 lg:gap-y-6 lg:grid-cols-[minmax(0,1fr)_180px]
          xl:grid-cols-[220px_minmax(0,1fr)_180px]
          items-start content-start
        "
      >
        <div className="order-1 lg:col-start-1 lg:row-start-1 xl:col-start-1 xl:row-start-1">
          <div className="flex items-center gap-3">
            <PingDot />
            <h3 className="text-white text-2xl lg:text-3xl font-semibold">
              {item.title}
            </h3>
          </div>
        </div>

        <Tags
          tags={item.tags}
          className="order-2 mt-1 lg:mt-3 lg:col-start-1 lg:row-start-2 xl:mt-0 xl:col-start-2 xl:row-start-2"
        />

        <p
          className="
            order-3 mt-3
            text-white/80 lg:text-white/60
            text-sm leading-relaxed
            lg:order-2 lg:mt-0 lg:col-start-1 lg:row-start-3
            xl:col-start-2 xl:row-start-1 2xl:max-w-90
          "
        >
          {item.desc}
        </p>

        <div
          className="
            order-4 mt-2 w-full
            lg:order-3 lg:mt-0 lg:w-[180px] lg:justify-self-end lg:col-start-2 lg:row-start-1 lg:row-span-3
            xl:col-start-3 xl:row-start-1
          "
        >
          <StatCard
            stat={item.stat}
            image={item.image}
            title={item.title}
            className="w-full lg:w-[180px]"
          />
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
      const imageTargets = section.querySelectorAll("[data-service-image]");
      if (!words.length) return;

      if (prefersReducedMotion) {
        gsap.set(words, { yPercent: 0, opacity: 1, clearProps: "transform" });
        if (imageTargets.length) {
          gsap.set(imageTargets, { scale: 1, clearProps: "transform" });
        }
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

      if (imageTargets.length) {
        gsap.set(imageTargets, { scale: 1 });

        imageTargets.forEach((target) => {
          gsap.to(target, {
            scale: 1.2,
            ease: "none",
            scrollTrigger: {
              trigger: target,
              start: "top 80%",
              end: "bottom top",
              scrub: true,
              // markers: true,
            },
          });
        });
      }

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
      <div className="bg-black w-full rounded-3xl overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT MAIN */}
        <div className="w-full lg:w-2/5 2xl:w-3/5 flex flex-col justify-start p-6 lg:p-10  ">
          <span className="text-sm md:text-xl font-medium text-white">
            [services]
          </span>

          <div className="flex-1 flex lg:mt-10">
            <h1
              ref={headingRef}
              className="text-white text-4xl sm:text-5xl xl md:text-5xl lg:text-6xl xl:text-8xl font-bold tracking-[-0.04em] pt-6 lg:pt-8 leading-[0.95]"
              aria-label="STRATEGY. DESIGN. GROWTH."
            >
              {["STRATEGY.", "DESIGN.", "GROWTH."].map((word, index, all) => (
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
        <div className="w-full p-6 lg:p-10 flex flex-col">
          <div className="border-t border-white/10 mb-6 lg:hidden" />

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
