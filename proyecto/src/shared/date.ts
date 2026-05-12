const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function nowIso(): string {
  return new Date().toISOString();
}

export function addCalendarDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_IN_MS);
}

export function parseOptionalIso(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function daysLate(actual: Date, expected: Date): number {
  return Math.ceil((actual.getTime() - expected.getTime()) / DAY_IN_MS);
}
