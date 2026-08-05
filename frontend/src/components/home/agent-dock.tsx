"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AGENTS } from "./data";

const group: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delayChildren: 0.08, staggerChildren: 0.06 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

export function AgentDock() {
  const shouldReduceMotion = useReducedMotion();
  const [activeId, setActiveId] = React.useState(AGENTS[0].id);
  const active = AGENTS.find((a) => a.id === activeId) ?? AGENTS[0];

  return (
    <motion.section
      variants={group}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
      aria-label="Agent 交互区"
    >
      {/* 标题 + 状态徽标 */}
      <div className="mb-7 flex items-end justify-between gap-4 border-b border-border/70 pb-4">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          Agent 交互区
        </h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          即将上线
        </span>
      </div>

      {/* 角色卡片 */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {AGENTS.map((agent) => {
          const isActive = agent.id === activeId;
          return (
            <motion.button
              key={agent.id}
              type="button"
              onClick={() => setActiveId(agent.id)}
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={isActive}
              className={cn(
                "group relative flex min-h-36 flex-col items-start gap-2 rounded-lg border p-4 text-left transition-[border-color,background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary/45 bg-primary/8"
                  : "border-border bg-card/70 hover:border-primary/25 hover:bg-accent/60"
              )}
            >
              <span
                className="flex size-10 items-center justify-center rounded-md border border-border bg-secondary text-xl"
                aria-hidden
              >
                {agent.avatar}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {agent.name}
              </span>
              <span className="text-xs text-muted-foreground">{agent.tagline}</span>
              {isActive && (
                <motion.span
                  layoutId="agent-active-dot"
                  className="absolute right-3 top-3 size-2 rounded-full bg-primary"
                  aria-hidden
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* 预留聊天交互区 */}
      <motion.div
        variants={item}
        className="mt-4 rounded-lg border border-dashed border-border bg-card/45 p-4"
      >
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-base" aria-hidden>
            {active.avatar}
          </span>
          <span className="text-foreground">{active.name}</span>
          <span className="text-muted-foreground/70">·</span>
          <span className="text-xs">{active.prompt}</span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="agent-message" className="sr-only">
            发送给 {active.name} 的消息
          </label>
          <Input
            id="agent-message"
            type="text"
            disabled
            placeholder="交互能力正在路上…"
            className="flex-1"
          />
          <Button size="icon" disabled aria-label="发送">
            <Send />
          </Button>
        </div>
      </motion.div>
    </motion.section>
  );
}
