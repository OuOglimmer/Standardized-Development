"use client";

import { motion } from "framer-motion";
import type { PortfolioRow } from "../data";
import { TrailGlow, ShimmerOverlay, LightSweep, PlaceholderMockup } from "../effects";

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

export function WideCard({
  item,
  isCenter,
}: {
  item: PortfolioRow["wide"];
  isCenter: boolean;
}) {
  return (
    <motion.div variants={cardUp} className="group relative">
      <TrailGlow />
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl"
        animate={isCenter ? { y: -6 } : { y: 0 }}
        whileHover={{ y: -10 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <ShimmerOverlay />
        <LightSweep isCenter={isCenter} />

        {isCenter && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)_inset]"
            aria-hidden
          />
        )}

        <div className="relative z-10 flex flex-col p-5 sm:p-6">
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
        </div>
      </motion.div>
    </motion.div>
  );
}