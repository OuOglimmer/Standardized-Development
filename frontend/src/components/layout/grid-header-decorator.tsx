"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function GridHeaderDecorator() {
  const shouldReduceMotion = useReducedMotion();
  const [viewportHeight, setViewportHeight] = useState(1000);
  const { scrollY } = useScroll();
  const y = useTransform(
    scrollY,
    [0, viewportHeight],
    [0, -viewportHeight * 0.3],
    { clamp: true }
  );

  useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(window.innerHeight);

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight, { passive: true });
    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  return (
    <motion.div
      aria-hidden
      className="bg-grid-decor pointer-events-none fixed inset-x-0 top-0 z-0 h-[30dvh]"
      style={{ y: shouldReduceMotion ? 0 : y, willChange: "transform" }}
    />
  );
}
