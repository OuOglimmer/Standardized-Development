"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zhCN } from "date-fns/locale";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePost, fetchPosts, type Post } from "@/lib/api/posts";
import { formatDateParam } from "@/lib/date-utils";
import { cardVariants } from "./animations";
import { DiarySubmit } from "./diary-submit";

const DIARY_PAGE_SIZE = 100;

function formatDiaryDate(value: string | null): string {
  if (!value) return "";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return `${year}年${Number(month)}月${Number(day)}日`;
}

async function fetchAllDiaries(diaryDate?: string): Promise<Post[]> {
  const diaries: Post[] = [];
  let offset = 0;

  while (true) {
    const page = await fetchPosts({
      content_type: "diary",
      diary_date: diaryDate,
      is_published: true,
      limit: DIARY_PAGE_SIZE,
      offset,
    });
    diaries.push(...page);

    if (page.length < DIARY_PAGE_SIZE) {
      return diaries;
    }
    offset += DIARY_PAGE_SIZE;
  }
}

export function DiaryFeed({ showTitle = true }: { showTitle?: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const selectedDiaryDate = selectedDate ? formatDateParam(selectedDate) : undefined;

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["posts", "diary", selectedDiaryDate ?? "all"],
    queryFn: () => fetchAllDiaries(selectedDiaryDate),
  });

  const { data: calendarPosts = [] } = useQuery({
    queryKey: ["posts", "diary", "calendar"],
    queryFn: () => fetchAllDiaries(),
  });
  const diaryDates = calendarPosts
    .map((post) => post.diary_date)
    .filter((date): date is string => Boolean(date))
    .map((date) => new Date(`${date}T00:00:00`));

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: async () => {
      setPostToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["posts", "diary"] });
    },
  });

  const openDeleteDialog = (post: Post) => {
    deleteMutation.reset();
    setPostToDelete(post);
  };

  const closeDeleteDialog = () => {
    if (!deleteMutation.isPending) {
      setPostToDelete(null);
      deleteMutation.reset();
    }
  };

  return (
    <section
      className={`relative isolate mx-auto w-full max-w-5xl px-4 sm:px-6 ${
        showTitle ? "py-16 sm:py-24" : "pb-16 sm:pb-24"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-8 -z-10 h-52 rounded-lg border border-border/50 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px] opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      {showTitle && (
        <>
          <div className="relative mb-12">
            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-2 flex items-center gap-3 text-4xl font-semibold text-foreground sm:text-5xl"
            >
              日记
              <Sparkles className="mt-1 size-6 text-primary/70 sm:size-7" aria-hidden />
            </motion.h1>
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-base text-muted-foreground"
            >
              记录日常思考与碎碎念
            </motion.p>
            <div
              aria-hidden
              className="mt-6 h-px w-28 bg-gradient-to-r from-primary/45 via-border to-transparent"
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <aside className="w-full shrink-0 lg:w-1/3">
          <div className="lg:sticky lg:top-28">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground">日历</h2>
              <DiarySubmit mode="diary" />
            </div>
            <div className="relative overflow-hidden rounded-lg border border-border bg-card/85 shadow-sm backdrop-blur-sm">
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/35 via-border to-transparent"
              />
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(date) => setSelectedDate(date ?? null)}
                locale={zhCN}
                modifiers={{ hasDiary: diaryDates }}
                modifiersClassNames={{ hasDiary: "[&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:size-1 [&>button]:after:rounded-full [&>button]:after:bg-primary" }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start"
              onClick={() => setSelectedDate(null)}
              disabled={selectedDate === null}
            >
              显示全部日记
            </Button>
          </div>
        </aside>

        <main className="flex-1">
          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {error instanceof Error ? error.message : "日记加载失败"}
            </div>
          ) : isLoading ? (
            <div className="space-y-4" aria-label="日记加载中">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-lg border border-border bg-card/60" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-card/35 px-6 py-12 text-center text-sm text-muted-foreground">
              {selectedDate === null ? "暂无日记" : "这一天还没有日记"}
            </p>
          ) : (
            <motion.div
              initial={shouldReduceMotion ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="relative flex flex-col gap-6 before:absolute before:bottom-10 before:left-4 before:top-10 before:w-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent sm:before:left-6"
            >
              {posts.map((entry, i) => (
                <DiaryCard
                  key={entry.id}
                  entry={entry}
                  index={i}
                  canDelete={isAdmin}
                  reduceMotion={Boolean(shouldReduceMotion)}
                  onDelete={openDeleteDialog}
                />
              ))}
            </motion.div>
          )}
        </main>
      </div>

      <Dialog
        open={postToDelete !== null}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>删除这篇日记？</DialogTitle>
            <DialogDescription>
              删除后会永久移除日记正文及其数据库记录，无法恢复。
            </DialogDescription>
          </DialogHeader>

          {deleteMutation.error && (
            <p className="text-sm text-destructive">
              {deleteMutation.error instanceof Error
                ? deleteMutation.error.message
                : "删除失败"}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={deleteMutation.isPending}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (postToDelete) deleteMutation.mutate(postToDelete.id);
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 />
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function DiaryCard({
  entry,
  index,
  canDelete,
  reduceMotion,
  onDelete,
}: {
  entry: Post;
  index: number;
  canDelete: boolean;
  reduceMotion: boolean;
  onDelete: (entry: Post) => void;
}) {
  return (
    <motion.article
      variants={cardVariants}
      custom={index}
      whileHover={reduceMotion ? undefined : {
        y: -4,
        boxShadow:
          "0 12px 28px -8px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.02)",
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className="group relative overflow-hidden rounded-lg border border-border/80 bg-card/70 p-6 pl-10 transition-[border-color,background-color,transform] hover:border-primary/25 hover:bg-card sm:p-8 sm:pl-14"
    >
      <span
        aria-hidden
        className="absolute left-4 top-8 size-2 rounded-full bg-primary/55 ring-4 ring-background transition-colors group-hover:bg-primary sm:left-6"
      />
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/25 via-border to-transparent"
      />
      <div className="mb-4 flex items-center justify-between">
        <time
          dateTime={entry.diary_date ?? undefined}
          className="text-sm font-medium text-muted-foreground"
        >
          {formatDiaryDate(entry.diary_date)}
        </time>
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="mood">
            {entry.emoji}
          </span>
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              aria-label="删除日记"
              title="删除日记"
              onClick={() => onDelete(entry)}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-[600px]">
        <p className="leading-[1.7] text-foreground/85 whitespace-pre-wrap">
          {entry.content}
        </p>
      </div>

      {entry.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}
