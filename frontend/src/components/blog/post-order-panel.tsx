"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ListOrdered } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updatePostOrder, type Post } from "@/lib/api/posts";

interface PostOrderPanelProps {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  onSaved: () => Promise<void>;
}

export function PostOrderPanel({
  posts,
  isLoading,
  error,
  onSaved,
}: PostOrderPanelProps) {
  const [open, setOpen] = useState(false);
  const [orderedPosts, setOrderedPosts] = useState<Post[]>(posts);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setOrderedPosts(posts);
    }
  }, [open, posts]);

  const hasChanges = useMemo(
    () => orderedPosts.some((post, index) => post.id !== posts[index]?.id),
    [orderedPosts, posts]
  );

  const movePost = (index: number, offset: -1 | 1) => {
    setOrderedPosts((current) => {
      const targetIndex = index + offset;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await updatePostOrder(orderedPosts.map((post) => post.id));
      await onSaved();
      setOpen(false);
    } catch (saveErrorValue) {
      setSaveError(
        saveErrorValue instanceof Error ? saveErrorValue.message : "保存文章顺序失败"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await updatePostOrder([]);
      await onSaved();
      setOpen(false);
    } catch (resetError) {
      setSaveError(
        resetError instanceof Error ? resetError.message : "恢复默认排序失败"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <ListOrdered className="size-4" />
          管理顺序
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>管理 Blog 展示顺序</DialogTitle>
          <DialogDescription>
            上方文章会优先显示；未调整时默认按发布时间倒序排列。
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2" aria-label="文章顺序加载中">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive">
            {error.message}
          </p>
        ) : orderedPosts.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            暂无已发布的 Blog 文章
          </p>
        ) : (
          <ol className="max-h-[min(60vh,28rem)] space-y-2 overflow-y-auto pr-1">
            {orderedPosts.map((post, index) => (
              <li
                key={post.id}
                className="flex items-center gap-2 rounded-md border border-border/80 bg-card/70 p-2"
              >
                <span className="w-6 shrink-0 text-center text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {post.source_filename || post.slug}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`将 ${post.title} 上移`}
                    title="上移"
                    onClick={() => movePost(index, -1)}
                    disabled={index === 0 || isSaving}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`将 ${post.title} 下移`}
                    title="下移"
                    onClick={() => movePost(index, 1)}
                    disabled={index === orderedPosts.length - 1 || isSaving}
                  >
                    <ArrowDown />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}

        {saveError && (
          <p className="text-sm text-destructive" role="alert">
            {saveError}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => void handleReset()}
            disabled={isSaving || isLoading || Boolean(error) || posts.length === 0}
          >
            恢复时间排序
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !hasChanges || isLoading || Boolean(error)}
          >
            {isSaving ? "保存中..." : "保存顺序"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
