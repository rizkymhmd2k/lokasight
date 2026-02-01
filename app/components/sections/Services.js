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

const Services = () => {
  return (
    <div className="w-full px-4 pt-50 flex flex-col bg-backgroundlight">
      {/* container becomes column on mobile, row on desktop */}
      <div className="bg-black w-full rounded-3xl overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT MAIN */}
        <div className="w-full lg:w-4/5 flex flex-col p-6 lg:p-10">
          <span className="text-sm md:text-xl font-medium text-white">
            [services]
          </span>

          {/* mobile like screenshot: single line title */}
          <h1 className="text-white text-4xl md:text-6xl lg:text-8xl font-bold tracking-[-0.04em] pt-6 lg:pt-8 leading-[0.95]">
            WHAT WE DO BEST
          </h1>
        </div>

        {/* RIGHT SERVICES */}
        <div className="w-full p-6 lg:p-10 flex flex-col">
          {/* mobile divider under heading (like screenshot) */}
          <div className="border-t border-white/10 mb-6 lg:hidden" />

          {services.map((item, idx) => (
            <div key={idx} className="w-full">
              {/* ---------------- MOBILE LAYOUT ---------------- */}
              <div className="lg:hidden">
                {/* title */}
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <h3 className="text-white text-2xl font-semibold">
                    {item.title}
                  </h3>
                </div>

                {/* desc */}
                <p className="mt-3 text-white/80 text-sm leading-relaxed whitespace-pre-line">
                  {item.desc}
                </p>

                {/* tags */}
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

                {/* big image card */}
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

              {/* ---------------- DESKTOP LAYOUT (unchanged) ---------------- */}
              <div className="hidden lg:grid grid-cols-[220px_1fr_200px] gap-10 items-start">
                {/* COL 1: TITLE + TAGS */}
                <div className="pt-6">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <h3 className="text-white text-3xl font-semibold">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-3 py-1 rounded-full bg-white/10 text-white/60 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* COL 2: DESCRIPTION (MIDDLE) */}
                <div className="pt-6">
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                    {item.desc}
                  </p>
                </div>

                {/* COL 3: IMAGE CARD */}
                <div className="flex justify-end pt-2">
                  <div className="w-[180px] h-[180px] rounded-2xl bg-white relative overflow-hidden">
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

              {/* DIVIDER (both) */}
              {idx !== services.length - 1 && (
                <div className="mt-8 lg:mt-10 border-t border-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
