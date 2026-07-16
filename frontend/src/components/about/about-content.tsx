"use client";

import { motion } from "framer-motion";
import { PinballGame } from "./pinball-game";
import { TOOLS } from "./data";

export function AboutContent() {
  return (
    <section className="relative w-full py-16 lg:py-24 bg-background" aria-label="About content">
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-12">
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-3"
          >
            <div className="sticky top-24">
              <div className="mb-6">
                <span className="text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
                  tools stack
                </span>
              </div>
              <div className="space-y-2.5 border-l-2 border-muted pl-4">
                {TOOLS.map((tool, index) => (
                  <motion.p
                    key={tool}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 + index * 0.03, ease: "easeOut" }}
                    className="text-sm text-foreground/70 font-mono leading-relaxed"
                  >
                    {tool}
                  </motion.p>
                ))}
              </div>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-9"
          >
            <div className="rounded-3xl bg-gradient-to-br from-rose-400/20 via-pink-400/20 to-rose-300/30 p-1 dark:from-rose-900/30 dark:via-pink-900/30 dark:to-rose-800/40">
              <div className="relative rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 p-6 sm:p-8 dark:from-rose-950/50 dark:via-pink-950/50 dark:to-rose-900/50 border border-rose-200/50 dark:border-rose-800/50">
                <div className="mb-6">
                  <span className="text-xs font-mono font-medium uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
                    games
                  </span>
                </div>

                <div className="relative">
                  <div
                    className="absolute -top-4 -right-4 w-32 h-32 opacity-[0.03] pointer-events-none"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-rose-500">
                      <path d="M50 10 C70 10 80 20 80 40 C80 65 50 90 50 90 C50 90 20 65 20 40 C20 20 30 10 50 10 Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M50 25 C60 25 65 30 65 40 C65 50 50 65 50 65 C50 65 35 50 35 40 C35 30 40 25 50 25 Z" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                  <PinballGame />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}