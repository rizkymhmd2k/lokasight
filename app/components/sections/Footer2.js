const SOCIAL_LINKS = ["instagram", "youtube", "tiktok", "linkedin"];

const TOP_COLUMNS = [
  { items: SOCIAL_LINKS, align: "text-left justify-self-start" },
  { items: SOCIAL_LINKS, align: "text-left justify-self-center" },
  { items: SOCIAL_LINKS.slice(0, 3), align: "text-right justify-self-end" },
];

export default function Footer2() {
  return (
    <footer
      id="footer-2"
      className="relative overflow-hidden bg-backgroundlight px-4 py-6 md:px-7 md:py-7"
    >
      <div aria-hidden className="footer2-bg pointer-events-none absolute inset-0" />
      <div aria-hidden className="footer2-glow pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex min-h-[84vh] flex-col">
        <div className="grid grid-cols-3 pt-[34vh] text-[clamp(1.2rem,1.9vw,2.05rem)] font-semibold tracking-[-0.02em] text-black">
          {TOP_COLUMNS.map((column, index) => (
            <ul key={index} className={`space-y-1 leading-[1.25] ${column.align}`}>
              {column.items.map((item) => (
                <li key={`${index}-${item}`}>
                  <a href="#" className="transition-opacity hover:opacity-70">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>

        <h2 className="mt-auto mb-8 text-center text-[clamp(3.4rem,10.8vw,12.2rem)] font-black leading-[0.9] tracking-[-0.06em] text-black">
          Ready to Take Risk?
        </h2>

        <div className="flex items-end justify-between text-[clamp(1.15rem,1.65vw,1.7rem)] font-semibold tracking-[-0.02em] text-black">
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {SOCIAL_LINKS.map((item) => (
              <li key={item}>
                <a href="#" className="transition-opacity hover:opacity-70">
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <p>@2026</p>
        </div>
      </div>
    </footer>
  );
}
