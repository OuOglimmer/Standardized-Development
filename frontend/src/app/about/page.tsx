import { AboutHero } from "@/components/about/about-hero";
import { AboutContent } from "@/components/about/about-content";

export const metadata = {
  title: "About",
  description: "About OuOglimmer - Tech stack, games, and thoughts",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <AboutHero />
      <AboutContent />
    </div>
  );
}