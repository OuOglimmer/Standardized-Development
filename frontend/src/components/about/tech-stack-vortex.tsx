"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TOOLS } from "./data";

type MouseVars = CSSProperties & {
  "--mouse-x": string;
  "--mouse-y": string;
};

type VortexToken = {
  name: string;
  x: number[];
  y: number[];
  rotate: number[];
  delay: number;
  duration: number;
};

function buildVortexToken(name: string, index: number, total: number): VortexToken {
  const angle = (index / total) * Math.PI * 2;
  const phase = (index % 5) * 0.19;
  const distances = [0, 64, 126, 188];

  return {
    name,
    x: distances.map((distance, step) =>
      Math.cos(angle + phase * step + step * 0.46) * distance
    ),
    y: distances.map((distance, step) =>
      Math.sin(angle + phase * step + step * 0.46) * distance
    ),
    rotate: [0, 8 + index * 2, 18 + index * 3, 32 + index * 4],
    delay: index * 0.22,
    duration: 6.8 + (index % 4) * 0.35,
  };
}

export function TechStackVortex({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const vortexRef = useRef<HTMLDivElement>(null);
  const mouseVars: MouseVars = { "--mouse-x": "50%", "--mouse-y": "50%" };

  const tokens = useMemo(
    () => TOOLS.map((tool, index) => buildVortexToken(tool, index, TOOLS.length)),
    []
  );

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    event.currentTarget.style.setProperty(
      "--mouse-x",
      `${Math.max(0, Math.min(100, x)).toFixed(2)}%`
    );
    event.currentTarget.style.setProperty(
      "--mouse-y",
      `${Math.max(0, Math.min(100, y)).toFixed(2)}%`
    );
  }

  function resetPointerPosition() {
    vortexRef.current?.style.setProperty("--mouse-x", "50%");
    vortexRef.current?.style.setProperty("--mouse-y", "50%");
  }

  return (
    <Card className={cn("overflow-hidden border-border bg-card/70", className)}>
      <CardHeader>
        <CardTitle className="text-base">技术栈</CardTitle>
        <CardDescription>Next.js + FastAPI + Supabase 项目的常用开发工具链。</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={vortexRef}
          className="relative h-[360px] overflow-hidden rounded-lg border border-border bg-background/80"
          style={mouseVars}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetPointerPosition}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at var(--mouse-x) var(--mouse-y), color-mix(in oklch, var(--primary) 18%, transparent) 0, transparent 28%), radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--accent) 42%, transparent) 0, transparent 46%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              className="h-44 w-44 rounded-full border border-primary/15"
              animate={shouldReduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 24, ease: "linear", repeat: Infinity }}
            />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              className="h-24 w-24 rounded-full border border-border bg-background/65 shadow-sm backdrop-blur-sm"
              animate={shouldReduceMotion ? undefined : { scale: [1, 1.04, 1], rotate: -360 }}
              transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/20 bg-primary text-xs font-semibold text-primary-foreground shadow-md">
            Stack
          </div>

          {shouldReduceMotion ? (
            <ul className="relative z-10 grid h-full grid-cols-2 content-center gap-2 p-6 sm:grid-cols-3">
              {TOOLS.map((tool) => (
                <li
                  key={tool}
                  className="rounded-md border border-border bg-secondary/75 px-3 py-2 text-sm font-medium text-secondary-foreground"
                >
                  {tool}
                </li>
              ))}
            </ul>
          ) : (
            <div className="absolute left-1/2 top-1/2">
              {tokens.map((token) => (
                <motion.div
                  key={token.name}
                  className="absolute"
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.78 }}
                  animate={{
                    x: token.x,
                    y: token.y,
                    opacity: [0, 1, 0.86, 0],
                    rotate: token.rotate,
                    scale: [0.78, 1, 0.98, 0.82],
                  }}
                  transition={{
                    duration: token.duration,
                    delay: token.delay,
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatDelay: 0.15,
                  }}
                >
                  <span className="block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-background/82 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-md">
                    {token.name}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          <ul className="sr-only">
            {TOOLS.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
