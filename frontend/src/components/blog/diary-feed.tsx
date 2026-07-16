"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchPosts, type Post } from "@/lib/api/posts";
import { getRecentDays, formatMonth, formatDay, isSameDay } from "@/lib/date-utils";
import { cardVariants } from "./animations";
import { DiarySubmit } from "./diary-submit";

export function DiaryFeed({ showTitle = true }: { showTitle?: boolean }) {
  const recentDays = getRecentDays(7);
  const [selectedDate, setSelectedDate] = useState(recentDays[0]);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", "diary"],
    queryFn: () => fetchPosts({ is_published: true, limit: 50 }),
  });

  const filteredPosts = posts.filter(
    (p) => p.diary_date && isSameDay(new Date(p.diary_date), selectedDate)
  );

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
              {recentDays.map((day) => {
                const { date, dayName } = formatDay(day);
                const isActive = isSameDay(day, selectedDate);

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
          {isLoading ? (
            <p className="text-sm text-muted-foreground">加载中...</p>
          ) : filteredPosts.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              这一天还没有日记
            </p>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="flex flex-col gap-6"
            >
              {filteredPosts.map((entry, i) => (
                <DiaryCard key={entry.id} entry={entry} index={i} />
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </section>
  );
}

function DiaryCard({ entry, index }: { entry: Post; index: number }) {
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
        <time className="text-sm font-medium text-muted-foreground">
          {entry.created_at
            ? new Date(entry.created_at).toLocaleString("zh-CN", {
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </time>
        <span className="text-xl" role="img" aria-label="mood">
          {entry.emoji}
        </span>
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
