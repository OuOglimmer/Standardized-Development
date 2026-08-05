import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ArticleContentHeading } from "@/components/blog/article-heading";
import type { ArticleHeading } from "@/lib/article-headings";

interface MarkdownContentProps {
  content: string;
  headings: ArticleHeading[];
}

export function MarkdownContent({ content, headings }: MarkdownContentProps) {
  let headingIndex = 0;
  const nextHeadingId = () => headings[headingIndex++]?.id;

  return (
    <div className="break-words text-base leading-8 text-foreground/85 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_h1]:mb-5 [&_h1]:mt-10 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-4 [&_h2]:mt-9 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_hr]:my-8 [&_hr]:border-border [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-md [&_li]:my-1 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          h1: ({ node: _node, children }) => (
            <ArticleContentHeading depth={1} id={nextHeadingId()}>{children}</ArticleContentHeading>
          ),
          h2: ({ node: _node, children }) => (
            <ArticleContentHeading depth={2} id={nextHeadingId()}>{children}</ArticleContentHeading>
          ),
          h3: ({ node: _node, children }) => (
            <ArticleContentHeading depth={3} id={nextHeadingId()}>{children}</ArticleContentHeading>
          ),
          h4: ({ node: _node, children }) => (
            <ArticleContentHeading depth={4} id={nextHeadingId()}>{children}</ArticleContentHeading>
          ),
          h5: ({ node: _node, children }) => (
            <ArticleContentHeading depth={5} id={nextHeadingId()}>{children}</ArticleContentHeading>
          ),
          h6: ({ node: _node, children }) => (
            <ArticleContentHeading depth={6} id={nextHeadingId()}>{children}</ArticleContentHeading>
          ),
          a: ({ node: _node, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer noopener" />
          ),
          img: ({ node: _node, ...props }) => (
            // Markdown images are references only; binary upload is handled separately.
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} alt={props.alt ?? ""} loading="lazy" />
          ),
          table: ({ node: _node, ...props }) => (
            <div className="my-6 overflow-x-auto">
              <table {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
