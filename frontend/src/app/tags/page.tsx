import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";

export const metadata = {
  title: "Tags",
  description: "作品分类与标签",
};

export default function TagsPage() {
  return (
    <div className="min-h-screen">
      <PortfolioGrid />
    </div>
  );
}
