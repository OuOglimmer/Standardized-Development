import { AboutHero } from "@/components/about/about-hero";
import { AboutContent } from "@/components/about/about-content";
import { GridHeaderDecorator } from "@/components/layout/grid-header-decorator";

export const metadata = {
  title: "About",
  description: "About OuOglimmer - Tech stack, games, and thoughts",
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <GridHeaderDecorator />
      <AboutHero />
      <AboutContent />
    </div>
  );
}