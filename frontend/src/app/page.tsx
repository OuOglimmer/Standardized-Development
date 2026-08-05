import { Hero } from "@/components/home/hero";
import { AboutSection } from "@/components/home/about-section";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <div className="content-auto">
        <AboutSection />
      </div>
    </div>
  );
}
