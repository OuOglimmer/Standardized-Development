"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePost } from "@/lib/api/posts";

interface PostDeleteActionProps {
  postId: string;
  postTitle: string;
  redirectAfterDelete?: boolean;
}

export function PostDeleteAction({
  postId,
  postTitle,
  redirectAfterDelete = false,
}: PostDeleteActionProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      setOpen(false);
      if (redirectAfterDelete) {
        router.replace("/blog");
        router.refresh();
      }
    },
  });

  if (!isAdmin) return null;

  const closeDialog = () => {
    if (!deleteMutation.isPending) {
      setOpen(false);
      deleteMutation.reset();
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-destructive"
        aria-label={`删除文章：${postTitle}`}
        title="删除文章"
        onClick={() => setOpen(true)}
      >
        <Trash2 />
      </Button>

      <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : closeDialog())}>
        <DialogContent showCloseButton={!deleteMutation.isPending}>
          <DialogHeader>
            <DialogTitle>永久删除这篇文章？</DialogTitle>
            <DialogDescription>
              《{postTitle}》的正文、上传文件名、标签关联和评论关联都会从数据库删除，无法恢复。
            </DialogDescription>
          </DialogHeader>

          {deleteMutation.error && (
            <p className="text-sm text-destructive">
              {deleteMutation.error instanceof Error ? deleteMutation.error.message : "删除失败"}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={deleteMutation.isPending}>
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 />
              {deleteMutation.isPending ? "删除中..." : "永久删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
