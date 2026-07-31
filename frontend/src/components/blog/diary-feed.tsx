"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePost, fetchPosts, type Post } from "@/lib/api/posts";
import {
  formatDateParam,
  formatDay,
  formatMonth,
  getRecentDays,
  isSameDay,
} from "@/lib/date-utils";
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
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const recentDays = getRecentDays(7);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const selectedDiaryDate = selectedDate ? formatDateParam(selectedDate) : undefined;

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["posts", "diary", selectedDiaryDate ?? "all"],
    queryFn: () => fetchAllDiaries(selectedDiaryDate),
  });

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
      className={`mx-auto w-full max-w-5xl px-4 ${
        showTitle ? "py-16 sm:py-24" : "pb-16 sm:pb-24"
      }`}
    >
      {showTitle && (
        <>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-2 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            日记
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mb-12 text-center text-sm text-muted-foreground"
          >
            记录日常思考与碎碎念
          </motion.p>
        </>
      )}

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <aside className="w-full shrink-0 lg:w-1/3">
          <div className="lg:sticky lg:top-28">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {formatMonth(recentDays[0])}
              </h2>
              <DiarySubmit />
            </div>
            <ul className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm transition-colors lg:px-5 ${
                    selectedDate === null
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  全部
                </button>
              </li>
              {recentDays.map((day) => {
                const { date, dayName } = formatDay(day);
                const isActive = selectedDate !== null && isSameDay(day, selectedDate);

                return (
                  <motion.li
                    key={day.toISOString()}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.2 + recentDays.indexOf(day) * 0.04,
                      ease: "easeOut",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={`w-full rounded-xl px-4 py-2.5 text-left text-sm transition-colors lg:px-5 ${
                        isActive
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="block text-[15px] font-medium">
                        {date}日
                      </span>
                      <span className="block text-xs opacity-60">
                        {dayName}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </aside>

        <main className="flex-1">
          {error ? (
            <p className="mt-8 text-center text-sm text-destructive">
              {error instanceof Error ? error.message : "日记加载失败"}
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">加载中...</p>
          ) : posts.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              {selectedDate === null ? "暂无日记" : "这一天还没有日记"}
            </p>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="flex flex-col gap-6"
            >
              {posts.map((entry, i) => (
                <DiaryCard
                  key={entry.id}
                  entry={entry}
                  index={i}
                  canDelete={isAdmin}
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
              删除后将不再公开显示，但内容仍会保留在数据库中。
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
  onDelete,
}: {
  entry: Post;
  index: number;
  canDelete: boolean;
  onDelete: (entry: Post) => void;
}) {
  return (
    <motion.article
      variants={cardVariants}
      custom={index}
      whileHover={{
        y: -4,
        boxShadow:
          "0 12px 28px -8px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.02)",
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className="group rounded-2xl border border-border/50 bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-shadow duration-300 ease-in-out hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.08)] sm:p-8"
    >
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
              className="rounded-lg bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}
