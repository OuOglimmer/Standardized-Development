import { Hero } from "@/components/home/hero";
import { AgentDock } from "@/components/home/agent-dock";
import { AboutSection } from "@/components/home/about-section";
import { GridHeaderDecorator } from "@/components/layout/grid-header-decorator";

export default function Home() {
  return (
    <div className="relative flex flex-col">
      <GridHeaderDecorator />
      <Hero />
      <AgentDock />
      <AboutSection />
    </div>
  );
}
