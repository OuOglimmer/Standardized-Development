const DAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function getRecentDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

export function formatMonth(d: Date): string {
  return `${d.getMonth() + 1}月`;
}

export function formatDay(d: Date): { date: number; dayName: string } {
  return { date: d.getDate(), dayName: DAY_NAMES[d.getDay()] };
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
