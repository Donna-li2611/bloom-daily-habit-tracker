export function toLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromLocalDate(value: string): Date {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function addDays(value: string, days: number): string {
  const date = fromLocalDate(value);
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
}

export function startOfWeek(value: string): string {
  const date = fromLocalDate(value);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return toLocalDate(date);
}

export function endOfWeek(value: string): string {
  return addDays(startOfWeek(value), 6);
}

export function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) dates.push(cursor);
  return dates;
}

export function formatChineseDate(value: string): string {
  const date = fromLocalDate(value);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date);
}

export function formatChineseDateWithWeekday(value: string, includeYear = false): string {
  const date = fromLocalDate(value);
  const weekday = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(date);
  return `${includeYear ? `${date.getFullYear()}年` : ''}${date.getMonth() + 1}月${date.getDate()}日 ${weekday}`;
}

export function occurredAtForLocalDate(localDate: string, now = new Date()): string {
  if (localDate === toLocalDate(now)) return now.toISOString();
  return fromLocalDate(localDate).toISOString();
}

export function createId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
