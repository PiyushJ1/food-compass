// Date helpers for the events calendar (all client-side, no timezone
// conversion needed — dates are pre-formatted by the server in Sydney time).

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Return the Monday of the week containing `date` (local time). */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** "YYYY-MM-DD" from a Date (local time, matching the Sydney-formatted strings
 *  from the server — acceptable since both are Sydney-local when the user is in
 *  Sydney, and for display purposes the slight offset on servers is negligible). */
export function toDateStr(date: Date): string {
  return date.toLocaleDateString("en-CA"); // en-CA → "YYYY-MM-DD"
}

/** "3 Jun – 9 Jun 2026" */
export function formatWeekLabel(start: Date, end: Date): string {
  const s = `${start.getDate()} ${MONTH_LABELS[start.getMonth()]}`;
  const e = `${end.getDate()} ${MONTH_LABELS[end.getMonth()]} ${end.getFullYear()}`;
  return `${s} – ${e}`;
}
