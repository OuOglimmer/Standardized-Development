"use client";

import { motion } from "framer-motion";

export function TrailGlow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="pointer-events-none absolute -bottom-6 left-[10%] right-[10%] h-8 rounded-full"
      aria-hidden
    >
      <div className="size-full bg-gradient-to-t from-white/[0.04] to-transparent blur-xl" />
    </motion.div>
  );
}

export function ShimmerOverlay() {
  return (
    <motion.div
      initial={{ backgroundPosition: "200% 0" }}
      whileHover={{ backgroundPosition: "-200% 0" }}
      transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
    />
  );
}

export function LightSweep({ isCenter }: { isCenter: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      animate={
        isCenter
          ? {
              backgroundPosition: ["100% 0%", "0% 0%", "100% 0%"],
              transition: { duration: 4, repeat: Infinity, ease: "linear" },
            }
          : { backgroundPosition: "100% 0%" }
      }
    >
      <div className="size-full bg-[length:250%_100%] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
    </motion.div>
  );
}

export function PlaceholderMockup() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-white/[0.03]">
      <div className="flex flex-col items-center gap-3">
        <svg
          className="h-10 w-10 text-white/[0.12]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-24 rounded-full bg-white/[0.06]" />
          <div className="h-1.5 w-16 rounded-full bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

export function DecorativeGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute left-0 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 right-0 h-px w-1/2 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      <div className="absolute left-[60%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
    </div>
  );
}

export function AmbientGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden>
      <div className="absolute left-1/4 top-1/4 h-1/2 w-1/2 rounded-full bg-white/[0.02] blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/3 h-1/3 w-1/3 rounded-full bg-white/[0.015] blur-[100px]" />
    </div>
  );
}