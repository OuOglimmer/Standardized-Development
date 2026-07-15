"use client";

import { motion } from "framer-motion";

export function AboutHero() {
  return (
    <section
      className="relative w-full bg-muted/50 border-b border-blue-500/30 dark:border-blue-400/20 py-20 lg:py-32"
      aria-labelledby="about-hero-title"
    >
      <div className="mx-auto max-w-3xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1
            id="about-hero-title"
            className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            About
            <br />
            <span className="text-blue-500 dark:text-blue-400">Me</span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="max-w-xl mx-auto text-lg text-muted-foreground leading-relaxed sm:text-xl"
          >
            一个在代码里找秩序、在文字里找节奏的开发者。热爱技术，更热爱用技术解决实际问题。
            这里记录技术思考、项目复盘，以及生活里的碎碎念。
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5">
            📍 Earth · Remote
          </span>
          <span className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5">
            ✉️ OuOglimmer@outlook.com
          </span>
        </motion.div>
      </div>

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}