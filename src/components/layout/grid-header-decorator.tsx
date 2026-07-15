/**
 * 页面顶部装饰区（局部草稿纸网格背景）
 *
 * - 绝对定位在页面顶部,高度 20vh,不影响文档流布局
 * - 融入正常文档流滚动(非 fixed 吸顶),滚两下即移出视野
 * - 底部边缘通过渐变蒙版柔和淡出(.bg-grid-decor)
 * - 每个路由页面独立注入,保持顶部视觉一致
 */
export function GridHeaderDecorator() {
  return (
    <div
      aria-hidden
      className="bg-grid-decor pointer-events-none absolute inset-x-0 top-0 z-0"
      style={{ height: "20vh" }}
    />
  );
}
