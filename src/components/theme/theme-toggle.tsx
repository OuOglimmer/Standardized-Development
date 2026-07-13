"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "./use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="切换主题"
      onClick={toggleTheme}
      // 挂载前主题未知，避免渲染与服务端不一致的图标
      suppressHydrationWarning
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <Sun className="size-4" />
      )}
    </Button>
  );
}
