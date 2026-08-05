"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, RotateCcw, Search } from "lucide-react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/auth-provider";
import { DiarySubmit } from "@/components/blog/diary-submit";
import { PostOrderPanel } from "@/components/blog/post-order-panel";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchPosts, type Post } from "@/lib/api/posts";

const BLOG_PAGE_SIZE = 6;
const BLOG_ORDER_PAGE_SIZE = 100;
const BLOG_STALE_TIME_MS = 2 * 60 * 1000;
const BLOG_GC_TIME_MS = 30 * 60 * 1000;

async function fetchAllBlogPosts(): Promise<Post[]> {
  const posts: Post[] = [];
  let offset = 0;

  while (true) {
    const page = await fetchPosts({
      content_type: "blog",
      is_published: true,
      limit: BLOG_ORDER_PAGE_SIZE,
      offset,
    });
    posts.push(...page);

    if (page.length < BLOG_ORDER_PAGE_SIZE) {
      return posts;
    }
    offset += BLOG_ORDER_PAGE_SIZE;
  }
}

export function PostList() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["posts", "blog", "list", submittedQuery],
    queryFn: ({ pageParam }) =>
      fetchPosts({
        content_type: "blog",
        is_published: true,
        q: submittedQuery || undefined,
        limit: BLOG_PAGE_SIZE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === BLOG_PAGE_SIZE ? pages.length * BLOG_PAGE_SIZE : undefined,
    staleTime: BLOG_STALE_TIME_MS,
    gcTime: BLOG_GC_TIME_MS,
  });
  const posts = data?.pages.flat() ?? [];
  const {
    data: orderPosts = [],
    error: orderError,
    isLoading: isOrderLoading,
  } = useQuery({
    queryKey: ["posts", "blog", "order"],
    queryFn: fetchAllBlogPosts,
    enabled: isAdmin,
    staleTime: BLOG_STALE_TIME_MS,
  });

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetchingNextPage || isFetchNextPageError) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void fetchNextPage();
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage]);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">Blog</h1>
          <p className="mt-3 text-base text-muted-foreground">技术、思考与生活记录。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <PostOrderPanel
              posts={orderPosts}
              isLoading={isOrderLoading}
              error={orderError instanceof Error ? orderError : null}
              onSaved={async () => {
                await queryClient.invalidateQueries({ queryKey: ["posts", "blog"] });
              }}
            />
          )}
          <DiarySubmit mode="blog" />
        </div>
      </div>

      <form
        className="flex max-w-2xl gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query.trim());
        }}
      >
        <label htmlFor="blog-search" className="sr-only">
          搜索文章
        </label>
        <Input
          id="blog-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题、摘要或正文"
        />
        <Button
          type="submit"
          variant="outline"
          size="icon-lg"
          aria-label="搜索"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div aria-live="polite">
        {error && posts.length === 0 ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "文章加载失败"}
          </div>
        ) : isLoading ? (
          <div className="grid gap-4" aria-label="文章加载中">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-border bg-card/60 p-5">
                <div className="h-5 w-2/5 animate-pulse rounded bg-muted" />
                <div className="mt-4 h-4 w-full animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/35 px-6 py-12 text-center">
            <p className="font-medium text-foreground">暂时没有匹配的文章</p>
            <p className="mt-2 text-sm text-muted-foreground">尝试缩短关键词或清空搜索条件。</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <div ref={loadMoreRef} className="flex min-h-16 items-center justify-center pt-4">
              {isFetchingNextPage ? (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  加载中
                </span>
              ) : isFetchNextPageError ? (
                <Button type="button" variant="outline" onClick={() => void fetchNextPage()}>
                  <RotateCcw className="size-4" />
                  重新加载
                </Button>
              ) : hasNextPage ? (
                <Button type="button" variant="ghost" onClick={() => void fetchNextPage()}>
                  加载更多
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">已显示全部文章</span>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
