"use client";

import { motion, type Variants } from "framer-motion";
import { GRID_ITEMS } from "./data";
import { PlaceholderMockup } from "./effects";

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
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
      >
        我的作品
      </motion.h2>

      <div className="rounded-3xl bg-[#121212] p-5 shadow-2xl sm:p-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-[2fr_1fr] auto-rows-auto gap-4 sm:gap-5"
        >
          {GRID_ITEMS.map((item, i) => {
            const isWide = item.type === "wide";
            const rowIdx = Math.floor(i / 2);

            return (
              <motion.article
                key={item.id}
                variants={itemVariants}
                custom={rowIdx}
                whileHover={{
                  y: -6,
                  boxShadow: "0 20px 48px -12px rgba(0,0,0,0.5)",
                  transition: { duration: 0.35, ease: "easeInOut" },
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl will-change-transform"
              >
                {item.label && (
                  <span className="pointer-events-none absolute left-5 top-4 z-10 text-[11px] font-medium uppercase tracking-[0.15em] text-white/25">
                    {item.label}
                  </span>
                )}

                <div
                  className={`flex flex-col p-5 sm:p-6 ${
                    item.label ? "pt-10 sm:pt-11" : ""
                  }`}
                >
                  {isWide ? (
                    <>
                      <div className="mb-4 aspect-[16/10] w-full overflow-hidden rounded-xl bg-white/[0.02]">
                        <PlaceholderMockup />
                      </div>
                      <h3 className="text-base font-semibold tracking-tight text-white/85 sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/45">
                        {item.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-white/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/20">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/55">
                        {item.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[11px] font-medium text-white/35"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
