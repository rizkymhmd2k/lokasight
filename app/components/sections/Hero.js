export default function Hero() {
  const navItems = ["HOME", "WORK", "SERVICES", "CONTACT"];

  return (
    <section className="px-4 py-4 flex flex-col items-center justify-between h-screen">
      <div className="w-full">
        <nav className="flex justify-between border border-red-500">
          {navItems.map((item) => (
            <a key={item} href="#" className="font-bold text-md">
              {item}
            </a>
          ))}
        </nav>
        <h1 className="text-[26vw] font-bold tracking-[-0.04em] leading-[0.8] text-center">
          formrizk
        </h1>
        <div className="w-full flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-[0.5em] h-[0.5em] rounded-full bg-reddot mx-[0.05em]"></span>{" "}
            <h2>working globally</h2>
          </div>
          <h2 className="text-end text-2xl tracking-[-0.04em] font-bold">
            STUDIO
          </h2>
        </div>
      </div>

      <div className="w-full flex justify-between">
        <h2 className="max-w-84 text-md">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec at
          justo imperdiet, mollis lectus eu, sagittis sem. Phasellus vitae
          bibendum libero. Donec at justo imperdiet, mollis lectus eu, sagittis
          sem. Donec at justo imperdiet, mollis lectus eu, sagittis sem. Donec
          at justo imperdiet, mollis lectus eu, sagittis sem. Donec at justo
        </h2>
        <div className="flex flex-col justify-end text-end">
          <h2>WE DESIGN BOLD</h2>
          <h2>AND MODERN FORMS</h2>
        </div>
      </div>
    </section>
  );
}
