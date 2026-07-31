"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { DiarySubmit } from "@/components/blog/diary-submit";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchPosts } from "@/lib/api/posts";

export function PostList() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["posts", "blog", submittedQuery],
    queryFn: () =>
      fetchPosts({
        content_type: "blog",
        is_published: true,
        q: submittedQuery || undefined,
        limit: 10,
      }),
  });

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16 sm:py-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Blog</h1>
          <p className="mt-2 text-sm text-muted-foreground">技术、思考与生活记录。</p>
        </div>
        <DiarySubmit />
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query.trim());
        }}
      >
        <Input
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

      {error ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "文章加载失败"}
        </p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">加载中...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无文章</p>
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
