"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { SiteNav } from "@/components/layout/site-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let animationFrame: number | null = null;

    const updateScrollState = () => {
      animationFrame = null;
      setIsScrolled(window.scrollY > 24);
    };
    const handleScroll = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateScrollState);
      }
    };

    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-transparent px-2 sm:px-4">
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-2 sm:px-2",
          "transition-[height,margin,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isScrolled
            ? "mt-2 h-12 rounded-lg border border-border/55 bg-background/48 shadow-[0_10px_34px_-18px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/36"
            : "h-16 border border-transparent bg-transparent shadow-none"
        )}
      >
        {/* 左侧：站点名 */}
        <Link
          href="/"
          className="shrink-0 text-base font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          OuOglimmer
        </Link>

        {/* 右侧：导航 + 主题切换 */}
        <div className="flex min-w-0 items-center gap-1">
          <SiteNav />
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          <AuthDialog />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
