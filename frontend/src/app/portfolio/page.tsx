import { PortfolioSection } from "@/components/portfolio/portfolio-section";

export const metadata = {
  title: "Portfolio",
  description: "我的作品集 — 项目展示与案例",
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen">
      <PortfolioSection />
    </div>
  );
}