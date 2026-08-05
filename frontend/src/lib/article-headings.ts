import { toString } from "mdast-util-to-string";
import remarkParse from "remark-parse";
import { unified } from "unified";

export type HeadingDepth = 1 | 2 | 3 | 4 | 5 | 6;

export interface ArticleHeading {
  depth: HeadingDepth;
  id: string;
  text: string;
}

export function createHeadingIdFactory() {
  const occurrences = new Map<string, number>();

  return (text: string) => {
    const base =
      text
        .normalize("NFKC")
        .trim()
        .toLocaleLowerCase()
        .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
        .replace(/^-+|-+$/g, "") || "section";
    const occurrence = (occurrences.get(base) ?? 0) + 1;

    occurrences.set(base, occurrence);
    return occurrence === 1 ? base : `${base}-${occurrence}`;
  };
}

export function extractArticleHeadings(content: string): ArticleHeading[] {
  const tree = unified().use(remarkParse).parse(content);
  const createId = createHeadingIdFactory();

  return tree.children.flatMap((node) => {
    if (node.type !== "heading") {
      return [];
    }

    const text = toString(node).trim();
    if (!text) {
      return [];
    }

    return [{ depth: node.depth, id: createId(text), text }];
  });
}
