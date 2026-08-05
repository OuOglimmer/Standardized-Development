"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePenLine, FileUp, Plus, X } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createPost, type CreatePostBody } from "@/lib/api/posts";
import { createTag, fetchTags } from "@/lib/api/tags";
import {
  createTagSlug,
  createUploadSlug,
  parseMarkdownFile,
  type StoredContentFormat,
} from "@/lib/markdown";

type PublishMode = "diary" | "blog";
const MAX_MARKDOWN_FILE_SIZE = 1_048_576;
const DIARY_EMOJIS = [
  "😊",
  "😌",
  "🙂",
  "🥰",
  "🤔",
  "😴",
  "😭",
  "😤",
  "🌤️",
  "🌧️",
  "🌙",
  "✨",
  "🌱",
  "🍃",
  "☕",
  "📚",
  "💻",
  "🎧",
  "📝",
  "🏃",
  "🍜",
  "🎬",
  "🧘",
  "🎯",
] as const;

interface CreatePostInput {
  body: CreatePostBody;
  tagNames: string[];
}

function getLocalDateInputValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function DiarySubmit({ mode }: { mode: PublishMode }) {
  const { session, isAdmin } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceFilename, setSourceFilename] = useState<string | null>(null);
  const [sourceContentFormat, setSourceContentFormat] =
    useState<Extract<StoredContentFormat, "markdown" | "mdx">>("markdown");
  const [frontmatterSlug, setFrontmatterSlug] = useState<string | null>(null);
  const [frontmatterDescription, setFrontmatterDescription] = useState<string | null>(null);
  const [frontmatterTags, setFrontmatterTags] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [emoji, setEmoji] = useState("😊");
  const [diaryDate, setDiaryDate] = useState(getLocalDateInputValue);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async ({ body, tagNames }: CreatePostInput) => {
      const tagIds = await resolveTagIds(tagNames);
      return createPost({
        ...body,
        tag_ids: tagIds,
      });
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setOpen(false);
      setTitle("");
      setContent("");
      setSourceFilename(null);
      setSourceContentFormat("markdown");
      setFrontmatterSlug(null);
      setFrontmatterDescription(null);
      setFrontmatterTags([]);
      setFileError(null);
      setEmoji("😊");
      setDiaryDate(getLocalDateInputValue());
      if (mode === "blog") {
        router.push(`/blog/${post.slug}`);
      } else {
        router.refresh();
      }
    },
  });

  const resetFileState = () => {
    setSourceFilename(null);
    setSourceContentFormat("markdown");
    setFrontmatterSlug(null);
    setFrontmatterDescription(null);
    setFrontmatterTags([]);
    setFileError(null);
  };

  const resolveTagIds = async (tagNames: string[]): Promise<string[]> => {
    const uniqueNames = Array.from(new Set(tagNames.map((tag) => tag.trim()).filter(Boolean)));
    if (uniqueNames.length === 0) return [];

    const tags = await fetchTags();
    const tagsByName = new Map(tags.map((tag) => [tag.name.toLowerCase(), tag]));
    const resolvedIds: string[] = [];

    for (const name of uniqueNames) {
      const existing = tagsByName.get(name.toLowerCase());
      if (existing) {
        resolvedIds.push(existing.id);
        continue;
      }

      try {
        const created = await createTag({
          name,
          slug: createTagSlug(name),
        });
        resolvedIds.push(created.id);
        tagsByName.set(created.name.toLowerCase(), created);
      } catch {
        const refreshedTags = await fetchTags();
        const refreshed = refreshedTags.find(
          (tag) => tag.name.toLowerCase() === name.toLowerCase()
        );
        if (refreshed) {
          resolvedIds.push(refreshed.id);
        } else {
          throw new Error(`标签创建失败：${name}`);
        }
      }
    }

    return resolvedIds;
  };

  if (!session) {
    return (
      <AuthDialog
        trigger={
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            登录后发布
          </Button>
        }
      />
    );
  }

  if (!isAdmin) {
    return (
      <Button variant="outline" size="sm" disabled>
        仅作者可发布
      </Button>
    );
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setFileError(null);
    if (!/\.(md|mdx)$/i.test(file.name)) {
      setFileError("仅支持 .md 或 .mdx 文件");
      return;
    }
    if (file.name.length > 255) {
      setFileError("文件名不能超过 255 个字符");
      return;
    }
    if (file.size > MAX_MARKDOWN_FILE_SIZE) {
      setFileError("文件大小不能超过 1 MB");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseMarkdownFile(file.name, text);
      if (!parsed.content.trim()) {
        setFileError("文件内容不能为空");
        return;
      }
      setContent(parsed.content);
      setSourceContentFormat(parsed.contentFormat);
      setSourceFilename(file.name);
      setFrontmatterSlug(parsed.slug ?? null);
      setFrontmatterDescription(parsed.description ?? null);
      setFrontmatterTags(parsed.tags);
      if (parsed.title) {
        setTitle(parsed.title);
      }
    } catch {
      setFileError("文件解析失败，请检查 frontmatter 或 MDX 内容");
    }
  };

  const clearUploadedFile = () => {
    resetFileState();
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    const trimmedTitle = mode === "blog" ? title.trim() : `${diaryDate} 日记`;
    const slug =
      mode === "blog"
        ? createUploadSlug({
            fileName: sourceFilename ?? trimmedTitle,
            frontmatterSlug: frontmatterSlug ?? undefined,
            title: trimmedTitle,
          })
        : `diary-${diaryDate}-${Date.now()}`;

    const body: CreatePostBody = {
      slug,
      title: trimmedTitle,
      content: mode === "blog" ? content : content.trim(),
      content_format: mode === "blog" ? sourceContentFormat : "plain",
      source_filename: mode === "blog" ? sourceFilename ?? undefined : undefined,
      description:
        mode === "blog"
          ? frontmatterDescription ?? content.trim().slice(0, 120)
          : content.trim().slice(0, 120),
      emoji: mode === "diary" ? emoji : "",
      diary_date: mode === "diary" ? diaryDate : undefined,
      is_published: true,
    };

    mutation.mutate({
      body,
      tagNames: mode === "blog" ? frontmatterTags : [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          发布
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "blog" ? "发布 Blog" : "发布日记"}</DialogTitle>
          <DialogDescription>
            {mode === "blog" ? "发布一篇 Blog 文章。" : "记录当天的日记。"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {mode === "blog" ? (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                标题
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.mdx,text/markdown,text/mdx"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex min-h-8 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5"
                >
                  <FileUp className="h-3.5 w-3.5" />
                  上传 Markdown
                </Button>
                {sourceFilename && (
                  <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                    <span className="truncate">{sourceFilename}</span>
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 uppercase">
                      {sourceContentFormat}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={clearUploadedFile}
                      title="清除文件来源"
                      aria-label="清除文件来源"
                    >
                      <X />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                日期
                <Input
                  type="date"
                  value={diaryDate}
                  onChange={(event) => setDiaryDate(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                心情
                <Input
                  type="text"
                  value={emoji}
                  onChange={(event) => setEmoji(event.target.value)}
                  className="w-16 px-2 text-center text-base"
                  maxLength={8}
                />
              </label>
            </div>
          )}

          {mode === "diary" && (
            <div className="grid grid-cols-8 gap-1.5 rounded-lg border border-border/70 bg-muted/25 p-2">
              {DIARY_EMOJIS.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={emoji === option ? "secondary" : "ghost"}
                  size="icon-sm"
                  className="text-base"
                  aria-label={`选择 ${option}`}
                  aria-pressed={emoji === option}
                  onClick={() => setEmoji(option)}
                >
                  <span aria-hidden>{option}</span>
                </Button>
              ))}
            </div>
          )}

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={mode === "diary" ? "今天发生了什么？" : "输入 Markdown 正文，或上传 .md/.mdx 文件"}
            rows={6}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />

          {fileError && <p className="text-sm text-destructive">{fileError}</p>}

          {mutation.error && (
            <p className="text-sm text-destructive">
              {mutation.error instanceof Error ? mutation.error.message : "发布失败"}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || (mode === "blog" && !title.trim()) || mutation.isPending}
            className="gap-2"
          >
            <FilePenLine className="h-4 w-4" />
            {mutation.isPending ? "发布中..." : "发布"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
