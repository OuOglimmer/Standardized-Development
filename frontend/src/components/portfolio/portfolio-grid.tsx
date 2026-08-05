"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fetchProjects, type Project } from "@/lib/api/projects";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 64, scale: 0.96 },
  show: (rowIdx: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: rowIdx * 0.15,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function PortfolioGrid() {
  const shouldReduceMotion = useReducedMotion();
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
      <motion.h2
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 text-4xl font-semibold text-foreground sm:text-5xl"
      >
        我的作品
      </motion.h2>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : "作品加载失败"}
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2" aria-label="作品加载中">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-lg border border-border bg-card/60" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/35 px-6 py-12 text-center text-sm text-muted-foreground">
          暂无公开作品
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card/55 p-4 sm:p-6">
          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 auto-rows-auto gap-4 md:grid-cols-[2fr_1fr] md:gap-5"
          >
            {projects.map((item, i) => {
              const isWide = item.type === "wide";
              const rowIdx = Math.floor(i / 2);
              const slug = item.slug;

              return (
                <motion.article
                  key={item.id}
                  variants={itemVariants}
                  custom={rowIdx}
                  whileHover={shouldReduceMotion ? undefined : {
                    y: -3,
                    boxShadow: "0 20px 48px -12px rgba(0,0,0,0.5)",
                    transition: { duration: 0.35, ease: "easeInOut" },
                  }}
                  className="group relative overflow-hidden rounded-lg border border-border bg-background/45 backdrop-blur-xl"
                >
                  {slug ? (
                    <Link href={`/portfolio/${slug}`} className="block h-full">
                      <ProjectCardContent item={item} isWide={isWide} />
                    </Link>
                  ) : (
                    <ProjectCardContent item={item} isWide={isWide} />
                  )}
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      )}
    </section>
  );
}

function ProjectCardContent({
  item,
  isWide,
}: {
  item: Project;
  isWide: boolean;
}) {
  return (
    <>
      {item.featured_image && isWide && (
        <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted/40">
          <img
            src={item.featured_image}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div
        className={`flex flex-col p-5 sm:p-6 ${isWide ? "" : "pt-10 sm:pt-11"}`}
      >
        {isWide ? (
          <>
            <h3 className="text-base font-semibold text-foreground sm:text-lg">
              {item.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-md border border-border bg-secondary/70 px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-md border border-border bg-secondary/70 px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
