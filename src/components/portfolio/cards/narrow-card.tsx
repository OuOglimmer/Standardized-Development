"use client";

import { motion } from "framer-motion";
import type { PortfolioRow } from "../data";
import { TrailGlow, ShimmerOverlay } from "../effects";

const cardUp = {
  hidden: { opacity: 0, y: 72, scale: 0.96, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export function NarrowCard({
  item,
}: {
  item: PortfolioRow["narrow"];
}) {
  return (
    <motion.div variants={cardUp} className="group relative">
      <TrailGlow />
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <ShimmerOverlay />
        <div className="relative z-10 flex flex-col p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/20">
              {item.title}
            </span>
          </div>
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
        </div>
      </motion.div>
    </motion.div>
  );
}