"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createPost, type CreatePostBody } from "@/lib/api/posts";

export function DiarySubmit() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("😊");
  const [diaryDate, setDiaryDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (body: CreatePostBody) => createPost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setOpen(false);
      setContent("");
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    mutation.mutate({
      slug: `diary-${diaryDate}-${Date.now()}`,
      content: content.trim(),
      emoji,
      diary_date: diaryDate,
      is_published: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          写日记
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>写日记</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">日期</label>
            <input
              type="date"
              value={diaryDate}
              onChange={(e) => setDiaryDate(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            />
            <label className="text-sm font-medium">心情</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-12 rounded-md border border-input bg-background px-2 py-1.5 text-center text-sm"
              maxLength={4}
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天发生了什么？"
            rows={6}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
          />
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || mutation.isPending}
          >
            {mutation.isPending ? "提交中..." : "发布"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
