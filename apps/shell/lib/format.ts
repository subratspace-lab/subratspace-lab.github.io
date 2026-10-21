/** "2025–2026", or just "2026" for a single-year project. Client-safe (no content import). */
export function formatPeriod(period: { start: number; end: number }): string {
  return period.start === period.end ? String(period.start) : `${period.start}–${period.end}`;
}
