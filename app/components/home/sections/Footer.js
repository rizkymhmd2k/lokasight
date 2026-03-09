const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Behance", href: "#" },
  { label: "Dribbble", href: "#" },
  { label: "LinkedIn", href: "#" },
];

const TOP_COLUMNS = [
  {
    title: "Navigation",
    align: "md:text-left md:justify-self-start",
    items: [
      { label: "Home", href: "#home" },
      { label: "Work", href: "#work" },
      { label: "Services", href: "#services" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Services",
    align: "md:text-left md:justify-self-center",
    items: [
      { label: "Brand Websites", href: "#services" },
      { label: "Web Development", href: "#services" },
      { label: "Creative Direction", href: "#services" },
    ],
  },
  {
    title: "Contact",
    align: "md:text-right md:justify-self-end",
    items: [
      { label: "hello@formrizk.com", href: "mailto:hello@formrizk.com" },
      { label: "Jakarta, Indonesia", href: "#" },
      { label: "Replies in 24h", href: "#" },
    ],
  },
];

export default function Footer2() {
  return (
    <footer
      id="footer-2"
      className="relative flex max-h-screen items-end overflow-hidden bg-backgroundlight px-4 sm:px-6 lg:px-8"
    >
      <div aria-hidden className="footer2-bg pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex h-full w-full flex-col justify-between pt-8 lg:pt-10">
        {/* MOBILE: base -> sm */}
        <div className="flex h-full flex-col justify-between md:hidden">
          {/* 1) Sitemap + large links */}
          <div className="max-w-[18rem] py-8 space-y-2">
            <p className="text-sm text-black/90 font-bold">Sitemap</p>
            <ul className="space-y-2 text-6xl font-semibold leading-[0.95] tracking-[-0.04em]">
              {TOP_COLUMNS[0].items.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="transition-opacity hover:opacity-70">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          {/* <div className="border-t border-black/5" /> */}

          {/* 2) Services + Contact */}
          <div className="grid grid-cols-2 gap-7 py-8 ">
            {TOP_COLUMNS.slice(1).map(({ title, items }, i) => (
              <div key={title} className={`space-y-3 ${i === 1 ? "text-right" : ""}`}>
                <p className="text-sm text-black/90 font-bold">{title}</p>
                <ul className="space-y-1 text-base sm:text-2xl font-bold leading-[1.12] tracking-[-0.02em]">
                  {items.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="transition-opacity hover:opacity-70">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          {/* <div className="border-t border-black/25" /> */}

        </div>

        {/* MD+: info grid */}
        <div className="hidden  py-10 md:grid md:grid-cols-3 md:gap-8 md:text-lg md:font-bold md:tracking-[-0.01em] md:text-black ">
          {TOP_COLUMNS.map(({ title, align, items }) => (
            <div key={title} className={align}>
              <p className="mb-3 text-lg uppercase tracking-[0.12em] text-black">{title}</p>
              <ul className="space-y-1 leading-[1.25]">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="transition-opacity hover:opacity-70">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* MD+: editorial social band */}
        <div className="hidden border-t border-black/15 py-6 md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-6 lg:py-8">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xl font-semibold tracking-[-0.02em] text-black lg:gap-x-8 lg:text-[clamp(1.15rem,1.65vw,1.7rem)]">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="transition-opacity hover:opacity-70">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <p className="justify-self-start text-[0.65rem] font-semibold uppercase leading-none tracking-[0.04em] text-black md:justify-self-end lg:text-xs">
            © 2026 / FORMRIZK STUDIO
          </p>
        </div>

        {/* Social links + copyright */}
        <div className="flex flex-col gap-2 border-t border-black/15 pt-8 pb-4 text-base font-semibold tracking-[-0.02em] text-black sm:text-xl md:hidden">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="transition-opacity hover:opacity-70">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-[0.65rem] font-semibold uppercase leading-none tracking-[0.04em] text-black">
            © 2026 / FORMRIZK STUDIO
          </p>
        </div>

        {/* Shared giant heading */}
        <div className="-mx-4 w-[calc(100%+2rem)] overflow-hidden sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
          <h2 className="-ml-[0.03em] w-full whitespace-nowrap text-[28vw] font-bold leading-[0.8] tracking-[-0.055em] text-black translate-y-[10%]">
            formrizk
          </h2>
        </div>
      </div>
    </footer>
  );
}
