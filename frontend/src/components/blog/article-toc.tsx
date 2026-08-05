"use client";

import { useId, useState } from "react";
import { ChevronDown, ListTree } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ArticleHeading, HeadingDepth } from "@/lib/article-headings";
import { cn } from "@/lib/utils";

const DEPTH_INDENT: Record<HeadingDepth, string> = {
  1: "pl-3",
  2: "pl-6",
  3: "pl-9",
  4: "pl-12",
  5: "pl-14",
  6: "pl-16",
};

export function ArticleToc({
  className,
  closeOnSelect = false,
  defaultOpen,
  headings,
}: {
  className?: string;
  closeOnSelect?: boolean;
  defaultOpen: boolean;
  headings: ArticleHeading[];
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const navigationId = useId();

  return (
    <aside className={cn("border-l border-border/80", className)} aria-label="文章目录">
      <Button
        type="button"
        variant="ghost"
        className="h-10 w-full justify-between rounded-none px-3 text-sm font-medium"
        aria-controls={navigationId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="inline-flex items-center gap-2">
          <ListTree className="size-4 text-primary" />
          文章目录
        </span>
        <ChevronDown
          className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")}
        />
      </Button>

      {isOpen && (
        <nav id={navigationId} className="pt-1" aria-label="本页标题">
          <ol className="space-y-0.5">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={() => closeOnSelect && setIsOpen(false)}
                  className={cn(
                    "block border-l border-transparent py-1.5 pr-3 text-sm leading-5 text-muted-foreground transition-colors",
                    "hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    DEPTH_INDENT[heading.depth]
                  )}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </aside>
  );
}
