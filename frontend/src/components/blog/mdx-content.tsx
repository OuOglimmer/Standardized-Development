import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";

import { ArticleContentHeading } from "@/components/blog/article-heading";
import type { ArticleHeading } from "@/lib/article-headings";
import { hasUnsupportedMdxDirectives } from "@/lib/markdown";

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 rounded-md border border-border bg-muted/50 px-4 py-3 text-sm leading-7 text-foreground/85">
      {children}
    </div>
  );
}

const components: MDXComponents = {
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="my-5 text-base leading-8 text-foreground/85" {...props} />
  ),
  a: ({ href, ...props }: ComponentPropsWithoutRef<"a">) => {
    if (href?.startsWith("/")) {
      return <Link href={href} className="font-medium text-primary underline underline-offset-4" {...props} />;
    }

    return (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-4"
        target="_blank"
        rel="noreferrer noopener"
        {...props}
      />
    );
  },
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-6 border-l-4 border-border pl-4 text-muted-foreground"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-md border border-border bg-muted p-4 [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
  img: (props: ComponentPropsWithoutRef<"img">) => (
    // Markdown image URLs are remote references; binary upload is handled separately.
    // eslint-disable-next-line @next/next/no-img-element
    <img className="my-6 max-w-full rounded-md" loading="lazy" alt={props.alt ?? ""} {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="border border-border bg-muted px-3 py-2 text-left" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border border-border px-3 py-2" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-5 list-disc pl-6" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-5 list-decimal pl-6" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="my-1" {...props} />,
  hr: (props: ComponentPropsWithoutRef<"hr">) => <hr className="my-8 border-border" {...props} />,
  Callout,
};

export function MdxContent({ content, headings }: { content: string; headings: ArticleHeading[] }) {
  if (hasUnsupportedMdxDirectives(content)) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        这篇 MDX 包含暂不支持的 import/export 语句。
      </div>
    );
  }

  let headingIndex = 0;
  const nextHeadingId = () => headings[headingIndex++]?.id;
  const contentComponents: MDXComponents = {
    ...components,
    h1: ({ children }) => (
      <ArticleContentHeading depth={1} id={nextHeadingId()}>{children}</ArticleContentHeading>
    ),
    h2: ({ children }) => (
      <ArticleContentHeading depth={2} id={nextHeadingId()}>{children}</ArticleContentHeading>
    ),
    h3: ({ children }) => (
      <ArticleContentHeading depth={3} id={nextHeadingId()}>{children}</ArticleContentHeading>
    ),
    h4: ({ children }) => (
      <ArticleContentHeading depth={4} id={nextHeadingId()}>{children}</ArticleContentHeading>
    ),
    h5: ({ children }) => (
      <ArticleContentHeading depth={5} id={nextHeadingId()}>{children}</ArticleContentHeading>
    ),
    h6: ({ children }) => (
      <ArticleContentHeading depth={6} id={nextHeadingId()}>{children}</ArticleContentHeading>
    ),
  };

  return (
    <div className="break-words text-base leading-8 text-foreground/85 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <MDXRemote
        source={content}
        components={contentComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </div>
  );
}
