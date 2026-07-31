import Link from "next/link";
import { CalendarDays, Clock3, Eye } from "lucide-react";

import { MarkdownContent } from "@/components/blog/markdown-content";
import type { Post } from "@/lib/api/posts";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function PostDetail({ post }: { post: Post }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-24">
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-base leading-7 text-muted-foreground">{post.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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
        </div>
      </div>

      {post.content_format === "markdown" ? (
        <MarkdownContent content={post.content} />
      ) : (
        <div className="whitespace-pre-wrap text-base leading-8 text-foreground/85">
          {post.content}
        </div>
      )}
    </article>
  );
}
