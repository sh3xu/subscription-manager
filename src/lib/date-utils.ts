export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  const targetDay = next.getDate();
  next.setMonth(next.getMonth() + months, 1);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(targetDay, lastDay));
  return next;
}

export function addYears(date: Date, years: number) {
  const next = new Date(date);
  const month = next.getMonth();
  next.setFullYear(next.getFullYear() + years);
  if (month !== next.getMonth()) {
    next.setDate(0);
  }
  return next;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function parseISO(value: string) {
  return new Date(value);
}

export function isAfter(a: Date, b: Date) {
  return a.getTime() > b.getTime();
}

export function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime();
}

export function isEqual(a: Date, b: Date) {
  return a.getTime() === b.getTime();
}

export function formatMonthDay(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

export function formatWeekdayMonthDay(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function dayDistanceFromNow(date: Date) {
  const now = new Date();
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diff = Math.round((startDate - startNow) / (1000 * 60 * 60 * 24));
  const abs = Math.abs(diff);
  const suffix = abs === 1 ? 'day' : 'days';
  if (diff === 0) return '0 days';
  return diff > 0 ? `in ${abs} ${suffix}` : `${abs} ${suffix} ago`;
}
