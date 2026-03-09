import ViewportIndicator from "./components/dev/ViewportIndicator";
import Hero from "./components/home/sections/Hero";
import Work from "./components/home/sections/Work";
import Services from "./components/home/sections/Services";
import About from "./components/home/sections/About";
import Contact from "./components/home/sections/Contact";
import Footer from "./components/home/sections/Footer";
import MobileNav from "./components/layout/MobileNav";
import HeroPinZone from "./components/shared/HeroPinZone";

export default function Home() {
  return (
    <main className="w-full">
      <ViewportIndicator />
      <MobileNav />

      <HeroPinZone>
        <Hero />
      </HeroPinZone>

      <section
        className="
          relative z-10
          min-h-screen
          -mt-[100vh]
          bg-neutral-950
          rounded-t-4xl
        "
      >
        <Work />
        <Services />
        <About />
        <Contact />
        <Footer />
      </section>
    </main>
  );
}
