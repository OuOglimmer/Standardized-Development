import { PortfolioSection } from "@/components/portfolio/portfolio-section";
import { GridHeaderDecorator } from "@/components/layout/grid-header-decorator";

export const metadata = {
  title: "Portfolio",
  description: "我的作品集 — 项目展示与案例",
};

export default function PortfolioPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <GridHeaderDecorator />
      <PortfolioSection />
    </div>
  );
}