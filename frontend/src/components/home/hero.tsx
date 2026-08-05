"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { Button } from "@/components/ui/button";

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? false : "hidden";

  return (
    <section
      className="relative flex min-h-[calc(100dvh-4rem)] w-full items-center overflow-hidden"
      aria-label="首页介绍"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-4 py-16 sm:px-6 md:py-20">
        <div className="max-w-3xl">
          <motion.p
            variants={reveal}
            initial={initial}
            animate="show"
            custom={0}
            className="mb-5 font-mono text-xs font-medium text-primary"
          >
            PERSONAL NOTES / 2026
          </motion.p>

          <motion.h1
            variants={reveal}
            initial={initial}
            animate="show"
            custom={0.06}
            className="relative w-fit font-display text-6xl font-semibold leading-[0.9] text-foreground sm:text-7xl lg:text-8xl"
            aria-label="OuOglimmer"
          >
            <span className="sr-only">OuOglimmer</span>
            <span
              aria-hidden
              className="absolute inset-0 text-primary/15 [transform:translate(0.055em,0.075em)]"
            >
              <span>OuO</span>
              <span className="italic">glimmer</span>
            </span>
            <span aria-hidden className="relative">
              <span>OuO</span>
              <span className="italic text-primary">glimmer</span>
            </span>
            <span
              aria-hidden
              className="absolute -bottom-3 left-0 h-px w-2/5 origin-left bg-primary/70"
            />
          </motion.h1>

          <motion.p
            variants={reveal}
            initial={initial}
            animate="show"
            custom={0.12}
            className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg"
          >
            记录技术实践、产品思考与日常观察，让复杂问题在文字中变得清晰。
          </motion.p>

          <motion.div
            variants={reveal}
            initial={initial}
            animate="show"
            custom={0.18}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild size="lg">
              <Link href="/blog">
                <BookOpen className="size-4" />
                阅读文章
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">
                关于我
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
