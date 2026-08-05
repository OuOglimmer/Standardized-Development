"use client";

import { type Variants, motion, useReducedMotion } from "framer-motion";
import { PORTFOLIO_ROWS } from "./data";
import { WideCard, NarrowCard } from "./cards";
import { DecorativeGrid, AmbientGlow } from "./effects";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

export function PortfolioSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
      aria-labelledby="portfolio-title"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 max-w-2xl sm:mb-12"
      >
        <h2
          id="portfolio-title"
          className="text-4xl font-semibold text-foreground sm:text-5xl"
        >
          我的作品
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          项目实践与界面设计记录。
        </p>
      </motion.div>

      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-card/65 shadow-[0_28px_90px_-52px_color-mix(in_oklch,var(--primary)_35%,transparent)] md:aspect-[4/3]">
        <DecorativeGrid />
        <AmbientGlow />

        <div className="relative z-10 flex h-full flex-col p-5 sm:p-8">
          <motion.div
            variants={container}
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="flex h-full flex-col gap-4 sm:gap-5"
          >
            {PORTFOLIO_ROWS.map((row, i) => (
              <div key={row.wide.id} className="grid flex-1 gap-4 md:grid-cols-[2fr_1fr] md:gap-5">
                <div className="flex flex-[2] flex-col">
                  {i === 0 && (
                    <span className="mb-2 text-xs font-medium text-muted-foreground">
                      UI 页面
                    </span>
                  )}
                  <div className="flex-1">
                    <WideCard item={row.wide} isCenter={i === 1} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  {i === 0 && (
                    <span className="mb-2 text-xs font-medium text-muted-foreground">
                      简介
                    </span>
                  )}
                  <div className="flex-1">
                    <NarrowCard item={row.narrow} />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
