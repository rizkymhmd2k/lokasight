import React from "react";

const services = [
  {
    title: "Branding",
    tags: ["Identity", "Competitive Analysis"],
    desc: `Lorem ipsum dolor sit amet, consectetur
adipiscing elit. Donec et lectus rutrum, fringilla
lorem et, pulvinar erat. Donec ante arcu,
ullamcorper non interdum et, bibendum eu
quam.`,
    stat: "143%",
  },
  {
    title: "Branding",
    tags: ["Identity", "Competitive Analysis"],
    desc: `Lorem ipsum dolor sit amet, consectetur
adipiscing elit. Donec et lectus rutrum, fringilla
lorem et, pulvinar erat. Donec ante arcu,
ullamcorper non interdum et, bibendum eu
quam.`,
    stat: "143%",
  },
  {
    title: "Branding",
    tags: ["Identity", "Competitive Analysis"],
    desc: `Lorem ipsum dolor sit amet, consectetur
adipiscing elit. Donec et lectus rutrum, fringilla
lorem et, pulvinar erat. Donec ante arcu,
ullamcorper non interdum et, bibendum eu
quam.`,
    stat: "143%",
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

function StatCard({ stat, className = "" }) {
  return (
    <div
      className={`w-[180px] h-[180px] rounded-2xl bg-white relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-yellow-200 to-yellow-400 opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-200/40 to-transparent" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 text-black/70 font-medium">
          <span className="text-sm">{stat}</span>
          <span className="text-sm">→</span>
        </div>
      </div>
    </div>
  );
}

function Tags({ tags }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
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

function ServiceItem({ item, idx, isLast }) {
  return (
    <div className="group w-full">
      {/* ---------------- MOBILE (same as your original) ---------------- */}
      <div className="lg:hidden">
        <div className="flex items-center gap-3 ">
          <PingDot />
          <h3 className="text-white text-2xl font-semibold">{item.title}</h3>
        </div>

        <p className="mt-3 text-white/80 text-sm leading-relaxed whitespace-pre-line">
          {item.desc}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-3 py-1 rounded-full bg-white/10 text-white/60 border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 w-full">
          <div className="w-full h-[180px] rounded-2xl bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-yellow-200 to-yellow-400 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-200/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 text-black/70 font-medium">
                <span className="text-sm">{item.stat}</span>
                <span className="text-sm">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- DESKTOP/TABLET ----------------
          lg: 2 columns via flex (text block | image)
          xl+: 3 columns via grid (title/tags | desc | image)
      */}
      <div className="hidden lg:block pt-6">
        <div
          className="
            lg:flex lg:gap-10 lg:items-start lg:content-start
            xl:grid xl:grid-cols-[220px_1fr_200px] xl:gap-10
            items-start content-start
          "
        >
          {/* COL 1 (xl) / TEXT BLOCK (lg) */}
          <div className="xl:col-start-1">
            <div className="flex items-center gap-3">
              <PingDot />
              <h3 className="text-white text-3xl font-semibold">
                {item.title}
              </h3>
            </div>
            <Tags tags={item.tags} />

            {/* On lg (2-col), description stays under tags in same left block */}
            <div className="xl:hidden mt-6">
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                {item.desc}
              </p>
            </div>
          </div>

          {/* COL 2 (xl only): DESCRIPTION */}
          <div className="hidden xl:block xl:col-start-2">
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
              {item.desc}
            </p>
          </div>

          {/* RIGHT IMAGE (always right on lg+) */}
          <div className="lg:ml-auto xl:ml-0 xl:col-start-3 flex justify-end self-start">
            <StatCard stat={item.stat} />
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      {!isLast && <div className="mt-8 lg:mt-10 border-t border-white/10" />}
    </div>
  );
}

const Services = () => {
  return (
    <div
      id="services"
      className="w-full px-4 pt-24 flex flex-col bg-backgroundlight"
    >
      <div className="bg-black w-full rounded-3xl overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT MAIN */}
        <div className="w-full lg:w-2/5 2xl:w-3/5 flex flex-col justify-start p-6 lg:p-10  border border-red-400">
          <span className="text-sm md:text-xl font-medium text-white">
            [services]
          </span>

          <div className="flex-1 flex mt-10">
            <h1 className="text-white text-4xl md:text-6xl lg:text-8xl font-bold tracking-[-0.04em] pt-6 lg:pt-8 leading-[0.95]">
              STRATEGY. DESIGN. GROWTH.{" "}
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
              idx={idx}
              isLast={idx === services.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
