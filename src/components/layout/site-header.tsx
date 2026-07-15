import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/tags", label: "Tags" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
        {/* 左侧：站点名 */}
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-foreground transition-colors hover:text-foreground/80"
        >
          OuOglimmer
        </Link>

        {/* 右侧：导航 + 主题切换 */}
        <nav className="group/nav flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground",
        "transition-colors hover:bg-muted hover:text-foreground",
        "group-hover/nav:animate-shake"
      )}
    >
      {label}
    </Link>
  );
}
