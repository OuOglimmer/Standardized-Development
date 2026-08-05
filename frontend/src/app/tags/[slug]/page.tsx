import { notFound } from "next/navigation";

import { PostCard } from "@/components/blog/post-card";
import { fetchPosts } from "@/lib/api/posts";
import { fetchTags } from "@/lib/api/tags";
import { TAGS_PAGE_VISIBLE } from "@/lib/features";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  if (!TAGS_PAGE_VISIBLE) {
    return { title: "Not Found" };
  }

  const { slug } = await params;
  const tags = await fetchTags();
  const tag = tags.find((item) => item.slug === slug);
  return {
    title: tag ? `#${tag.name}` : "Tag Not Found",
    description: tag ? `浏览 ${tag.name} 标签下的文章。` : "标签不存在。",
  };
}

export default async function TagPostsPage({ params }: Props) {
  if (!TAGS_PAGE_VISIBLE) {
    notFound();
  }

  const { slug } = await params;
  const [tags, posts] = await Promise.all([
    fetchTags(),
    fetchPosts({ is_published: true, tag: slug, limit: 100 }),
  ]);
  const tag = tags.find((item) => item.slug === slug);

  if (!tag) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16 sm:py-24">
      <div>
        <p className="text-sm font-medium text-primary">#{tag.name}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">标签文章</h1>
        <p className="mt-2 text-sm text-muted-foreground">{posts.length} 篇文章</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">这个标签下暂无文章</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
