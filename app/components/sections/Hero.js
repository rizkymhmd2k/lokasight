export default function Hero() {
  const navItems = ["HOME", "WORK", "SERVICES", "CONTACT"];

  return (
    <section className="px-4 py-4 flex flex-col items-center justify-between h-screen bg-[linear-gradient(180deg,rgba(206,216,54,0.5)_0%,#F8F7F3_40%)]">
      <div className="w-full">
        <nav className="grid grid-cols-4">
          {navItems.map((item, index) => (
            <div key={item} className={index === 3 ? "text-right" : ""}>
              <a href="#" className="font-bold text-md">
                {item}
              </a>
            </div>
          ))}
        </nav>
        <h1 className="text-[27vw] lg:text-[27.5vw] font-bold tracking-[-0.04em] leading-[0.8] text-center">
          formrizk
        </h1>
        <div className="grid grid-cols-4">
          <div className="col-start-2 col-span-2 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-[0.5em] h-[0.5em] rounded-full bg-reddot mx-[0.05em] animate-pulse"></span>
            <h2>working globally</h2>
          </div>
          <div className="col-start-4">
            <h2 className="text-2xl tracking-[-0.04em] font-bold text-right">
              STUDIO
            </h2>
          </div>
        </div>
      </div>
      <div className="w-full grid grid-cols-4">
        <div className="col-span-1">
          <p className="text-md">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
        <div className="col-start-4 flex flex-col text-right">
          <h2>WE DESIGN BOLD</h2>
          <h2>AND MODERN FORMS</h2>
        </div>
      </div>
    </section>
  );
}
