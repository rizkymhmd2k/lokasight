import HeroPinZone from "./components/HeroPinZone";
import Hero from "./components/sections/Hero";
import Work from "./components/sections/Work";
import WorkShowCase from "./components/sections/WorkShowCase";
import Services from "./components/sections/Services";
import About from "./components/sections/About";
import Testimony from "./components/sections/Testimony";


export default function Home() {
  return (
    <main className="w-full">
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
        <WorkShowCase />
        <Services />
        <About />
        <Testimony />
      </section>
    </main>
  );
}
