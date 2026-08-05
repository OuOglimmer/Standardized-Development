"use client";

import { Mail, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function AboutHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="relative w-full border-b border-border/70 py-16 sm:py-24"
      aria-labelledby="about-hero-title"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)] md:items-end">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            id="about-hero-title"
            className="text-5xl font-semibold leading-none text-foreground sm:text-6xl"
          >
            About Me
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            在代码里寻找秩序，在文字里记录思考。关注全栈开发、产品体验和真实问题的解决过程。
          </p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3 border-l border-primary/30 pl-5 text-sm text-muted-foreground"
        >
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" aria-hidden />
            Earth · Remote
          </p>
          <a
            href="mailto:OuOglimmer@outlook.com"
            className="flex items-center gap-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mail className="size-4 text-primary" aria-hidden />
            OuOglimmer@outlook.com
          </a>
        </motion.div>
      </div>
    </section>
  );
}
