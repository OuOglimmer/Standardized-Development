import Link from "next/link";
import { CalendarDays, Clock3, Eye, FileText } from "lucide-react";

import { ArticleToc } from "@/components/blog/article-toc";
import { MdxContent } from "@/components/blog/mdx-content";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { PostDeleteAction } from "@/components/blog/post-delete-action";
import { extractArticleHeadings } from "@/lib/article-headings";
import type { Post } from "@/lib/api/posts";
import { TAGS_PAGE_VISIBLE } from "@/lib/features";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function PostDetail({ post }: { post: Post }) {
  const headings =
    post.content_format === "markdown" || post.content_format === "mdx"
      ? extractArticleHeadings(post.content)
      : [];

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-16 sm:px-6 sm:py-24",
        headings.length > 0
          ? "grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,48rem)_16rem] lg:justify-center lg:gap-12 xl:gap-16"
          : "max-w-3xl"
      )}
    >
      <article className="min-w-0">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              TAGS_PAGE_VISIBLE ? (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
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

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-base leading-7 text-muted-foreground">{post.description}</p>
          )}

          <div className="flex items-center justify-between gap-3">
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
              {post.source_filename && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="truncate">{post.source_filename}</span>
                </span>
              )}
            </div>
            <PostDeleteAction postId={post.id} postTitle={post.title} redirectAfterDelete />
          </div>
        </div>

        {headings.length > 0 && (
          <ArticleToc
            className="mb-8 lg:hidden"
            closeOnSelect
            defaultOpen={false}
            headings={headings}
          />
        )}

        {post.content_format === "mdx" ? (
          <MdxContent content={post.content} headings={headings} />
        ) : post.content_format === "markdown" ? (
          <MarkdownContent content={post.content} headings={headings} />
        ) : (
          <div className="whitespace-pre-wrap text-base leading-8 text-foreground/85">
            {post.content}
          </div>
        )}
      </article>

      {headings.length > 0 && (
        <ArticleToc
          className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] self-start overflow-y-auto lg:block"
          defaultOpen
          headings={headings}
        />
      )}
    </div>
  );
}
