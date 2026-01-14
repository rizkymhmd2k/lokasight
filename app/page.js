import Image from "next/image";
import Hero from "./components/sections/Hero";
import Work from "./components/sections/Work";
import WorkShowCase from "./components/sections/WorkShowCase";
WorkShowCase;

export default function Home() {
  return (
    <main className="mx-auto  w-full">
      <Hero />
      <Work />
      <WorkShowCase />
      <Hero />
    </main>
  );
}
