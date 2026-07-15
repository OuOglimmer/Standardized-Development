import { DiaryFeed } from "@/components/blog/diary-feed";
import { GridHeaderDecorator } from "@/components/layout/grid-header-decorator";

export const metadata = {
  title: "Blog",
  description: "OuOglimmer's Blog —— 记录技术、思考与生活。",
};

export default function BlogPage() {
  return (
    <>
      <GridHeaderDecorator />
      <DiaryFeed />
    </>
  );
}
