"use client";

import { type Variants, motion } from "framer-motion";
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
  return (
    <section
      className="mx-auto w-full max-w-5xl px-4 py-20 sm:py-28"
      aria-labelledby="portfolio-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 text-center sm:mb-12"
      >
        <h2
          id="portfolio-title"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          我的作品
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Project Showcase
        </p>
      </motion.div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#121212] shadow-2xl">
        <DecorativeGrid />
        <AmbientGlow />

        <div className="relative z-10 flex h-full flex-col p-5 sm:p-8">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="flex h-full flex-col gap-4 sm:gap-5"
          >
            {PORTFOLIO_ROWS.map((row, i) => (
              <div key={row.wide.id} className="flex flex-1 gap-4 sm:gap-5">
                <div className="flex flex-[2] flex-col">
                  {i === 0 && (
                    <span className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-white/25">
                      UI 页面
                    </span>
                  )}
                  <div className="flex-1">
                    <WideCard item={row.wide} isCenter={i === 1} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  {i === 0 && (
                    <span className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-white/25">
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