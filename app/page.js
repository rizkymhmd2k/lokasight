import HeroPinZone from "./components/HeroPinZone";
import Hero from "./components/sections/Hero";
import Work from "./components/sections/Work";
import WorkShowCase from "./components/sections/WorkShowCase";
import Services from "./components/sections/Services";
import About from "./components/sections/About";
import Contact from "./components/sections/Contact";
import Footer from "./components/sections/Footer";
import Form from "./components/sections/Form";
import ViewportIndicator from "./components/ViewportIndicator";
import MobileNav from "./components/MobileNav";

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
          {/* <WorkShowCase /> */}
          <Services />
          <About />
          <Contact />
          {/* <Form /> */}
          <Footer />
      </section>
    </main>
  );
}
