import Image from "next/image";
import Hero from "./components/sections/Hero";
import Work from "./components/sections/Work";
import WorkShowCase from "./components/sections/WorkShowCase";
import Services from "./components/sections/Services";
WorkShowCase;

export default function Home() {
  return (
    <main className="mx-auto  w-full">
      <Hero />
      <Work />
      <WorkShowCase />
      <Services />
    </main>
  );
}
