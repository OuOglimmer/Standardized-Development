"use client";

import * as React from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * 主题切换 Hook。
 *
 * 初始状态与 layout.tsx 中的内联脚本读取同一来源（localStorage + 系统偏好），
 * 二者保持一致，避免 hydration mismatch。
 */
export function useTheme() {
  // 懒初始化：首次渲染（含 SSR）返回 "light"，挂载后同步真实偏好。
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setThemeState(getInitialTheme());
    setMounted(true);
  }, []);

  const applyTheme = React.useCallback((next: Theme) => {
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage 不可用时静默失败
    }
  }, []);

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next);
      applyTheme(next);
    },
    [applyTheme]
  );

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, mounted };
}
