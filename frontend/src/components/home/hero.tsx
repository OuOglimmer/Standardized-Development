"use client";

import { motion, type Variants } from "framer-motion";

const TITLE = "Welcome…";

// 容器：逐字 stagger 弹入
const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// 单个字符：从下方旋转弹入
const letter: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: -90 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: "spring", damping: 12, stiffness: 200 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function Hero() {
  return (
    <section
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
      aria-label="首屏欢迎"
    >
      {/* 背景径向光晕：亮/暗自适应 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,color-mix(in_oklch,currentColor_8%,transparent),transparent)] text-foreground"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 text-center">
        {/* 大 Title：逐字符弹入 */}
        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-wrap items-center justify-center gap-x-1 text-5xl font-bold tracking-tight text-foreground sm:text-7xl md:text-8xl"
          style={{ perspective: 600 }}
          aria-label={TITLE}
        >
          {TITLE.split("").map((ch, i) => (
            <motion.span
              key={`${ch}-${i}`}
              variants={letter}
              className="inline-block [transform-origin:center_bottom]"
              aria-hidden
            >
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
        </motion.h1>

        {/* 副标题 */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.6 }}
          className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          一个记录技术、思考与生活的个人博客。向下滚动，认识我，或直接和驻场的 Agent 们打个招呼。
        </motion.p>

        {/* 滚动提示 */}
        <motion.a
          href="#about"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 1 }}
          className="mt-12 inline-flex flex-col items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>向下滚动</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="text-lg"
            aria-hidden
          >
            ↓
          </motion.span>
        </motion.a>
      </div>
    </section>
  );
}
