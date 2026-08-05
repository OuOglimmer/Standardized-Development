"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TAGS_PAGE_VISIBLE } from "@/lib/features";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/diary", label: "diary" },
  { href: "/tags", label: "Tags" },
  { href: "/about", label: "About" },
] as const;

const VISIBLE_NAV_LINKS = NAV_LINKS.filter(
  (link) => link.href !== "/tags" || TAGS_PAGE_VISIBLE
);

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [animatedHref, setAnimatedHref] = useState<string | null>(null);
  const [animationRun, setAnimationRun] = useState(0);

  useEffect(() => {
    if (!pendingHref || pathname !== pendingHref) {
      return;
    }

    setAnimatedHref(pendingHref);
    setAnimationRun((run) => run + 1);
    setPendingHref(null);
  }, [pathname, pendingHref]);

  function handleNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    if (event.defaultPrevented || event.button !== 0 || isModifiedClick || pathname === href) {
      return;
    }

    setPendingHref(href);
  }

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
        {VISIBLE_NAV_LINKS.map((link) => {
          const isActive = isActivePath(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={(event) => handleNavigation(event, link.href)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative block rounded-md text-sm font-medium text-muted-foreground transition-colors [perspective:720px]",
                "hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "after:absolute after:inset-x-3 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform",
                isActive && "text-foreground after:scale-x-100"
              )}
            >
              <NavFlipLabel
                key={animatedHref === link.href ? animationRun : "idle"}
                label={link.label}
                isActive={isActive}
                isFlipping={animatedHref === link.href}
                reduceMotion={Boolean(reduceMotion)}
              />
            </Link>
          );
        })}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="打开导航菜单">
            <motion.span
              key={animatedHref ? animationRun : "idle"}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: animatedHref && !reduceMotion ? 180 : 0 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Menu className="size-4" />
            </motion.span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {VISIBLE_NAV_LINKS.map((link) => {
            const isActive = isActivePath(pathname, link.href);

            return (
              <DropdownMenuItem key={link.href} asChild>
                <Link
                  href={link.href}
                  onClick={(event) => handleNavigation(event, link.href)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn("w-full px-2.5 py-2", isActive && "bg-accent text-foreground")}
                >
                  {link.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function NavFlipLabel({
  label,
  isActive,
  isFlipping,
  reduceMotion,
}: {
  label: string;
  isActive: boolean;
  isFlipping: boolean;
  reduceMotion: boolean;
}) {
  return (
    <motion.span
      className={cn(
        "relative block rounded-md px-3 py-2 transition-colors [transform-style:preserve-3d]",
        "group-hover:bg-accent",
        isActive && "bg-accent"
      )}
      initial={{ rotateY: 0, y: 0, boxShadow: "0 0 0 rgba(0, 0, 0, 0)" }}
      animate={
        isFlipping && !reduceMotion
          ? {
              rotateY: 180,
              y: [0, -3, 0],
              boxShadow: [
                "0 0 0 rgba(0, 0, 0, 0)",
                "0 12px 24px rgba(0, 0, 0, 0.18)",
                "0 2px 8px rgba(0, 0, 0, 0.08)",
              ],
            }
          : { rotateY: 0, y: 0, boxShadow: "0 0 0 rgba(0, 0, 0, 0)" }
      }
      transition={{
        duration: 0.56,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.48, 1],
      }}
      style={{ willChange: isFlipping ? "transform, box-shadow" : "auto" }}
    >
      <span className="block [backface-visibility:hidden]">{label}</span>
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
      >
        {label}
      </span>
    </motion.span>
  );
}
