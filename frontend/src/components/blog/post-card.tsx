import Link from "next/link";
import { CalendarDays, Clock3, Eye, FileText } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PostDeleteAction } from "@/components/blog/post-delete-action";
import type { Post } from "@/lib/api/posts";
import { TAGS_PAGE_VISIBLE } from "@/lib/features";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Card className="group relative overflow-hidden border-border/80 bg-card/70 transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card">
      <Link
        href={`/blog/${post.slug}`}
        aria-label={`打开文章：${post.title}`}
        className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <CardHeader className="pointer-events-none relative z-10">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg transition-colors group-hover:text-primary">
            {post.title}
          </CardTitle>
          <div className="pointer-events-auto relative z-20">
            <PostDeleteAction postId={post.id} postTitle={post.title} />
          </div>
        </div>
        <CardDescription className="line-clamp-2 leading-6">
          {post.description || post.content.slice(0, 120)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pointer-events-none relative z-10 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(post.created_at)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {post.reading_time || 1} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.view_count}
          </span>
          {post.source_filename && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span className="max-w-48 truncate">{post.source_filename}</span>
            </span>
          )}
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              TAGS_PAGE_VISIBLE ? (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="pointer-events-auto relative z-20 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {tag.name}
                </Link>
              ) : (
                <span
                  key={tag.id}
                  className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tag.name}
                </span>
              )
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
