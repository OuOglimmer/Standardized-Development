import { Hero } from "@/components/home/hero";
import { AgentDock } from "@/components/home/agent-dock";
import { AboutSection } from "@/components/home/about-section";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <AgentDock />
      <AboutSection />
    </div>
  );
}
