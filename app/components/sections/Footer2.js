const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Behance", href: "#" },
  { label: "Dribbble", href: "#" },
  { label: "LinkedIn", href: "#" },
];

const TOP_COLUMNS = [
  {
    title: "Navigation",
    align: "lg:text-left lg:justify-self-start",
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
    align: "lg:text-left lg:justify-self-center",
    items: [
      { label: "Brand Websites", href: "#services" },
      { label: "Web Development", href: "#services" },
      { label: "Creative Direction", href: "#services" },
    ],
  },
  {
    title: "Contact",
    align: "lg:text-right lg:justify-self-end",
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
      className="relative flex items-end overflow-hidden bg-backgroundlight px-4 sm:px-6 lg:px-8 "
    >
      <div aria-hidden className="footer2-bg pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex h-full w-full flex-col justify-between pt-8 lg:py-10 ">
        {/* MOBILE / TABLET: base -> md */}
        <div className="lg:hidden flex flex-col h-full justify-between">
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

        {/* DESKTOP: lg+ */}
        <div className="hidden py-10 lg:grid lg:grid-cols-3 text-lg font-bold tracking-[-0.01em] text-black">
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

        {/* Shared giant heading (responsive) */}
        <h2 className=" -mx-4 py-8 lg:py-10 w-[calc(100%+2rem)] whitespace-nowrap -ml-[0.06em] text-[clamp(2rem,11.35vw,7.9rem)] lg:text-[clamp(3.5rem,12vw,235px)] font-bold leading-[0.9] tracking-[-0.06em] text-black">
          Ready To Take Risk?
        </h2>

        {/* Social links + copyright (responsive) */}
        <div className=" pt-8 pb-4 flex flex-col gap-2 text-base sm:text-xl lg:text-[clamp(1.15rem,1.65vw,1.7rem)] font-semibold tracking-[-0.02em] text-black lg:flex-row lg:items-end lg:justify-between">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 lg:gap-x-8 lg:gap-y-2">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="transition-opacity hover:opacity-70">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <p>© 2026 Formrizk Studio</p>
        </div>
      </div>
    </footer>
  );
}
