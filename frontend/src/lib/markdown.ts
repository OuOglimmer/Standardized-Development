import matter from "gray-matter";

export type StoredContentFormat = "plain" | "markdown" | "mdx";

interface ParsedMarkdownFile {
  content: string;
  contentFormat: Extract<StoredContentFormat, "markdown" | "mdx">;
  description?: string;
  slug?: string;
  tags: string[];
  title?: string;
}

const UNSUPPORTED_MDX_DIRECTIVE_PATTERN = /^\s*(import|export)\s/m;

function valueToString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return undefined;
}

function valueToStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => valueToString(item))
      .filter((item): item is string => Boolean(item));
  }

  const text = valueToString(value);
  if (!text) return [];

  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function removeExtension(fileName: string): string {
  return fileName.replace(/\.(md|mdx)$/i, "");
}

function firstMarkdownHeading(content: string): string | undefined {
  const heading = content
    .split("\n")
    .map((line) => line.match(/^#\s+(.+)$/)?.[1]?.trim())
    .find((line): line is string => Boolean(line));
  return heading;
}

export function createSlug(value: string, fallback = "blog"): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);

  return slug || fallback;
}

export function createUploadSlug(args: {
  fileName: string;
  frontmatterSlug?: string;
  title?: string;
}): string {
  if (args.frontmatterSlug) {
    return createSlug(args.frontmatterSlug);
  }

  const base = createSlug(args.title || removeExtension(args.fileName));
  return `${base}-${Date.now()}`;
}

export function createTagSlug(name: string): string {
  const slug = createSlug(name, "");
  if (slug) return slug.slice(0, 80);

  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return `tag-${hash.toString(36)}`;
}

export function parseMarkdownFile(fileName: string, rawContent: string): ParsedMarkdownFile {
  const contentFormat = /\.mdx$/i.test(fileName) ? "mdx" : "markdown";
  const parsed = matter(rawContent);
  const frontmatter = parsed.data as Record<string, unknown>;
  const content = parsed.content.trim();

  if (contentFormat === "mdx" && UNSUPPORTED_MDX_DIRECTIVE_PATTERN.test(content)) {
    throw new Error("暂不支持带 import/export 的 MDX 文件");
  }

  const title =
    valueToString(frontmatter.title) ||
    firstMarkdownHeading(content) ||
    removeExtension(fileName);

  return {
    content,
    contentFormat,
    description: valueToString(frontmatter.description),
    slug: valueToString(frontmatter.slug),
    tags: valueToStringList(frontmatter.tags),
    title,
  };
}

export function hasUnsupportedMdxDirectives(content: string): boolean {
  return UNSUPPORTED_MDX_DIRECTIVE_PATTERN.test(content);
}
