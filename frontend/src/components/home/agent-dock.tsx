"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AGENTS } from "./data";

const group: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delayChildren: 0.1, staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", damping: 14, stiffness: 220 } },
};

export function AgentDock() {
  const [activeId, setActiveId] = React.useState(AGENTS[0].id);
  const active = AGENTS.find((a) => a.id === activeId) ?? AGENTS[0];

  return (
    <motion.section
      variants={group}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto w-full max-w-3xl px-4 py-16"
      aria-label="Agent 交互区"
    >
      {/* 标题 + 状态徽标 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Agent 交互区
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
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
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={isActive}
              className={cn(
                "group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                isActive
                  ? "border-foreground/30 bg-muted"
                  : "border-border bg-card hover:bg-muted/60"
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg bg-gradient-to-br text-xl",
                  agent.accent
                )}
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
                  className="absolute right-3 top-3 size-2 rounded-full bg-foreground"
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
        className="mt-4 rounded-xl border border-dashed border-border bg-card/50 p-4"
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
          <input
            type="text"
            disabled
            placeholder="交互能力正在路上…"
            className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground placeholder:text-muted-foreground/60 disabled:cursor-not-allowed"
          />
          <Button size="icon" disabled aria-label="发送">
            <Send />
          </Button>
        </div>
      </motion.div>
    </motion.section>
  );
}
