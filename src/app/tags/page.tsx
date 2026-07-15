import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { GridHeaderDecorator } from "@/components/layout/grid-header-decorator";

export const metadata = {
  title: "Tags",
  description: "作品分类与标签",
};

export default function TagsPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <GridHeaderDecorator />
      <PortfolioGrid />
    </div>
  );
}
