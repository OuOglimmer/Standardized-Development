import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPosts } from "@/lib/api/posts";
import { fetchTags } from "@/lib/api/tags";
import { TAGS_PAGE_VISIBLE } from "@/lib/features";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tags",
  description: "按标签浏览文章。",
};

export default async function TagsPage() {
  if (!TAGS_PAGE_VISIBLE) {
    notFound();
  }

  const [tags, posts] = await Promise.all([
    fetchTags(),
    fetchPosts({ is_published: true, limit: 100 }),
  ]);

  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag.slug, (counts.get(tag.slug) ?? 0) + 1);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-24">
      <div>
        <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">Tags</h1>
        <p className="mt-3 text-base text-muted-foreground">按主题聚合文章。</p>
      </div>

      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无标签</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tags.map((tag) => (
            <Card key={tag.id} className="bg-card/70 transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card">
              <CardHeader>
                <CardTitle>
                  <Link href={`/tags/${tag.slug}`} className="hover:text-primary">
                    {tag.name}
                  </Link>
                </CardTitle>
                <CardDescription>{counts.get(tag.slug) ?? 0} 篇文章</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/tags/${tag.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  查看文章
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
