"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Eye, EyeOff, LogIn, LogOut, UserRound } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "./auth-provider";

export function AuthDialog({ trigger }: { trigger?: ReactNode }) {
  const { session, signIn, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
      setPassword("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutError(null);
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      setSignOutError(err instanceof Error ? err.message : "退出登录失败");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (mounted && session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="账户菜单" title="账户菜单">
            <UserRound className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            variant="destructive"
            disabled={isSigningOut}
            onSelect={() => void handleSignOut()}
          >
            <LogOut />
            {isSigningOut ? "退出中..." : "退出登录"}
          </DropdownMenuItem>
          {signOutError && (
            <p className="px-1.5 py-1 text-xs leading-5 text-destructive">{signOutError}</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <LogIn className="h-3.5 w-3.5" />
            登录
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>登录</DialogTitle>
          <DialogDescription>
            使用博客账号发布日记和 Blog。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            邮箱
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              autoComplete="email"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            密码
            <span className="relative">
              <Input
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pr-10"
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                aria-label={isPasswordVisible ? "隐藏密码" : "显示密码"}
                title={isPasswordVisible ? "隐藏密码" : "显示密码"}
              >
                {isPasswordVisible ? <EyeOff /> : <Eye />}
              </Button>
            </span>
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleSubmit}
            disabled={!email.trim() || password.length < 8 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "登录中..." : "登录"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
