import { createElement, type ReactNode } from "react";

import type { HeadingDepth } from "@/lib/article-headings";
import { cn } from "@/lib/utils";

const HEADING_STYLES: Record<HeadingDepth, string> = {
  1: "mb-5 mt-10 text-3xl font-bold",
  2: "mb-4 mt-9 text-2xl font-semibold",
  3: "mb-3 mt-8 text-xl font-semibold",
  4: "mb-3 mt-7 text-lg font-semibold",
  5: "mb-2 mt-6 text-base font-semibold",
  6: "mb-2 mt-6 text-sm font-semibold",
};

export function ArticleContentHeading({
  children,
  depth,
  id,
}: {
  children: ReactNode;
  depth: HeadingDepth;
  id?: string;
}) {
  return createElement(
    `h${depth}`,
    {
      id,
      className: cn("scroll-mt-24 text-foreground", HEADING_STYLES[depth]),
    },
    children
  );
}
