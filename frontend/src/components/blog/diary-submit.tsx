"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePenLine, FileUp, Plus, X } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createPost, type CreatePostBody } from "@/lib/api/posts";

type PublishMode = "diary" | "blog";
const MAX_MARKDOWN_FILE_SIZE = 1_048_576;

function createSlug(mode: PublishMode, date: string) {
  return `${mode}-${date}-${Date.now()}`;
}

export function DiarySubmit() {
  const { session, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PublishMode>("diary");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceFilename, setSourceFilename] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [emoji, setEmoji] = useState("😊");
  const [diaryDate, setDiaryDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (body: CreatePostBody) => createPost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setOpen(false);
      setTitle("");
      setContent("");
      setSourceFilename(null);
      setFileError(null);
    },
  });

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

  const handleModeChange = (nextMode: PublishMode) => {
    setMode(nextMode);
    setSourceFilename(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      if (!text.trim()) {
        setFileError("文件内容不能为空");
        return;
      }
      setContent(text);
      setSourceFilename(file.name);
    } catch {
      setFileError("文件读取失败，请重新选择");
    }
  };

  const clearUploadedFile = () => {
    setSourceFilename(null);
    setFileError(null);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    const trimmedTitle = mode === "blog" ? title.trim() : `${diaryDate} 日记`;

    const body: CreatePostBody = {
      slug: createSlug(mode, diaryDate),
      title: trimmedTitle,
      content: mode === "blog" ? content : content.trim(),
      content_format: mode === "blog" ? "markdown" : "plain",
      source_filename: mode === "blog" ? sourceFilename ?? undefined : undefined,
      description: content.trim().slice(0, 120),
      emoji: mode === "diary" ? emoji : "",
      diary_date: mode === "diary" ? diaryDate : undefined,
      is_published: true,
    };

    mutation.mutate(body);
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
          <DialogTitle>发布内容</DialogTitle>
          <DialogDescription>写一条日记，或发布一篇 Blog。</DialogDescription>
        </DialogHeader>

        <div className="flex rounded-lg border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => handleModeChange("diary")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "diary" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            日记
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("blog")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "blog" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Blog
          </button>
        </div>

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
                accept=".md,.mdx,text/markdown"
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
                <input
                  type="date"
                  value={diaryDate}
                  onChange={(event) => setDiaryDate(event.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                心情
                <input
                  type="text"
                  value={emoji}
                  onChange={(event) => setEmoji(event.target.value)}
                  className="h-9 w-14 rounded-md border border-input bg-background px-2 text-center text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  maxLength={4}
                />
              </label>
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
