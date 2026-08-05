"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { PortfolioRow } from "../data";

const cardUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.46, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function NarrowCard({ item }: { item: PortfolioRow["narrow"] }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      variants={cardUp}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      className="flex h-full min-h-44 flex-col justify-between rounded-lg border border-border bg-background/35 p-5 transition-colors hover:border-primary/20"
    >
      <div>
        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border bg-secondary/70 px-2.5 py-1 text-xs font-medium text-secondary-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.article>
  );
}
