"use client";

import { useEffect, useRef } from "react";

/**
 * 页面顶部装饰区（局部草稿纸网格 + 画布循环位移）
 *
 * - 始终 position: fixed,高度 30vh,header(backdrop-blur)透出可见网格
 * - 位于 header 之下层叠(z-0),不影响内容层与交互
 * - 背景做无限循环位移动画(慢速氛围,见 .bg-grid-decor 的 grid-scroll)
 * - 底部边缘通过渐变蒙版柔和淡出
 *
 * 滚动滑出(方案 A:transform 驱动,不切换 position,避免重排卡顿):
 * - scrollY 0 → 100vh:网格 translateY 0 → -30vh,刚好完整滑出视口顶部
 * - scrollY >= 100vh:translateY 锁定 -30vh,网格停在视口外上方
 * - 回滚:translateY 跟着回退,网格滑回顶部
 * - 全程只改 transform(GPU 合成层),丝滑无跳变
 *
 * 用 requestAnimationFrame 节流,滚动事件只标记 dirty,帧内统一更新,
 * 避免高频 scroll 回调阻塞主线程造成卡顿。
 */
export function GridHeaderDecorator() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dirty = false;

    const update = () => {
      dirty = false;
      const vh = window.innerHeight;
      const decorH = el.offsetHeight || vh * 0.3; // 30vh
      // 滚动进度 0 → 1,映射到 0 → -decorH
      const progress = Math.min(Math.max(window.scrollY / vh, 0), 1);
      el.style.transform = `translateY(${-progress * decorH}px)`;
    };

    const onScroll = () => {
      if (!dirty) {
        dirty = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="bg-grid-decor pointer-events-none fixed inset-x-0 top-0 z-0"
      style={{ height: "30vh", willChange: "transform" }}
    />
  );
}
