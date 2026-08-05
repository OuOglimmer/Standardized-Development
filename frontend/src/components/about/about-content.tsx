"use client";

import { motion, useReducedMotion } from "framer-motion";

import { TechStackBadges } from "./tech-stack-badges";

export function AboutContent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full py-16 sm:py-24" aria-label="技术栈">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl px-4 sm:px-6"
      >
        <TechStackBadges />
      </motion.div>
    </section>
  );
}
