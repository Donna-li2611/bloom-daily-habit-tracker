import type { CheckIn, HabitWithTarget } from './models';
import { evaluateTime } from './progress';
import { addDays, dateRange, fromLocalDate, toLocalDate } from '@/utils/date';

export type StatisticsPeriod = 'week' | 'month' | 'quarter' | 'year';

export interface StatisticsBucket { start: string; end: string; label: string }
export interface TimePoint { label: string; value: number; position: number }
export interface WeightPoint { label: string; value: number; position: number }
export interface MatrixCell { label: string; ratio: number; isFuture: boolean }
export interface MatrixRow { habitId: string; name: string; cells: MatrixCell[] }
export interface StatisticsSummary {
  wake: { target: number | null; points: TimePoint[] };
  sleep: { target: number | null; points: TimePoint[] };
  weight: { latest: number | null; change: number | null; points: WeightPoint[] };
  matrix: MatrixRow[];
}

export interface StatisticsWindow {
  start: string;
  end: string;
  label: string;
  buckets: StatisticsBucket[];
}

export function statisticsWindow(period: StatisticsPeriod, anchor: string): StatisticsWindow {
  const date = fromLocalDate(anchor);
  const year = date.getFullYear();
  const month = date.getMonth();
  if (period === 'week') {
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const start = toLocalDate(monday);
    const end = addDays(start, 6);
    return { start, end, label: `${shortDate(start)} → ${shortDate(end)}`, buckets: dateRange(start, end).map((day, index) => ({ start: day, end: day, label: '一二三四五六日'[index] ?? '' })) };
  }
  if (period === 'month') {
    const start = toLocalDate(new Date(year, month, 1, 12));
    const end = toLocalDate(new Date(year, month + 1, 0, 12));
    const buckets: StatisticsBucket[] = [];
    for (let cursor = 1; cursor <= Number(end.slice(8)); cursor += 6) {
      const bucketStart = toLocalDate(new Date(year, month, cursor, 12));
      const bucketEnd = toLocalDate(new Date(year, month, Math.min(cursor + 5, Number(end.slice(8))), 12));
      buckets.push({ start: bucketStart, end: bucketEnd, label: cursor === Number(bucketEnd.slice(8)) ? `${cursor}` : `${cursor}–${Number(bucketEnd.slice(8))}` });
    }
    return { start, end, label: `${year}年${month + 1}月`, buckets };
  }
  if (period === 'quarter') {
    const quarterStart = Math.floor(month / 3) * 3;
    const start = toLocalDate(new Date(year, quarterStart, 1, 12));
    const end = toLocalDate(new Date(year, quarterStart + 3, 0, 12));
    return { start, end, label: `${year}年第${quarterStart / 3 + 1}季度`, buckets: Array.from({ length: 3 }, (_, index) => monthBucket(year, quarterStart + index)) };
  }
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return { start, end, label: `${year}年`, buckets: Array.from({ length: 12 }, (_, index) => monthBucket(year, index)) };
}

export function moveStatisticsAnchor(period: StatisticsPeriod, anchor: string, amount: number): string {
  const date = fromLocalDate(anchor);
  if (period === 'week') return addDays(anchor, amount * 7);
  if (period === 'month') date.setMonth(date.getMonth() + amount);
  if (period === 'quarter') date.setMonth(date.getMonth() + amount * 3);
  if (period === 'year') date.setFullYear(date.getFullYear() + amount);
  return toLocalDate(date);
}

export function statisticsWindowHint(period: StatisticsPeriod, window: StatisticsWindow, today: string): string {
  const current = window.start <= today && today <= window.end;
  if (current) return period === 'week' ? '本周' : period === 'month' ? '本月' : period === 'quarter' ? '本季度' : '今年';
  return period === 'week' ? '所选周' : period === 'month' ? '所选月份' : period === 'quarter' ? '所选季度' : '所选年份';
}

export function buildStatistics(habits: HabitWithTarget[], checkIns: CheckIn[], window: StatisticsWindow, today: string): StatisticsSummary {
  const availableHabits = habits.filter((habit) => habit.status !== 'archived');
  const wake = availableHabits.find((habit) => habit.semanticKey === 'wake');
  const sleep = availableHabits.find((habit) => habit.semanticKey === 'sleep');
  const weight = availableHabits.find((habit) => habit.semanticKey === 'weight')
    ?? availableHabits.find((habit) => habit.measurementType === 'number' && habit.unit?.toLowerCase() === 'kg');
  const wakePoints = aggregateTimes(checkIns, wake?.id, window.buckets, false);
  const sleepPoints = aggregateTimes(checkIns, sleep?.id, window.buckets, true);
  const weightPoints = aggregateWeights(checkIns, weight?.id, window.buckets);
  const latest = weightPoints.at(-1)?.value ?? null;
  const first = weightPoints[0]?.value ?? null;
  return {
    wake: { target: timeToMinutes(wake?.target.targetTime ?? null, false), points: wakePoints },
    sleep: { target: timeToMinutes(sleep?.target.targetTime ?? null, true), points: sleepPoints },
    weight: { latest, change: latest !== null && first !== null && weightPoints.length > 1 ? latest - first : null, points: weightPoints },
    matrix: availableHabits.map((habit) => ({
      habitId: habit.id,
      name: habit.name,
      cells: window.buckets.map((bucket) => {
        const end = bucket.end > today ? today : bucket.end;
        if (bucket.start > today) return { label: bucket.label, ratio: 0, isFuture: true };
        const relevant = checkIns.filter((item) => item.habitId === habit.id && item.localDate >= bucket.start && item.localDate <= end);
        return { label: bucket.label, ratio: matrixRatio(habit, relevant), isFuture: false };
      }),
    })),
  };
}

function matrixRatio(habit: HabitWithTarget, checkIns: CheckIn[]): number {
  if (!checkIns.length) return 0;
  if (habit.measurementType === 'time') {
    const records = latestPerDay(checkIns).filter((item) => item.recordedTime);
    if (!records.length) return 0;
    const targetTime = habit.target.targetTime;
    const timeRule = habit.target.timeRule;
    if (!targetTime || !timeRule) return 1;
    return records.every((item) => evaluateTime(item.recordedTime as string, targetTime, timeRule, habit.target.targetTimeEnd)) ? 1 : 0.5;
  }
  if (habit.measurementType === 'duration') {
    const value = checkIns.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
    return value >= (habit.target.targetMinutes ?? 1) ? 1 : 0.5;
  }
  if (habit.measurementType === 'count') {
    const value = checkIns.reduce((sum, item) => sum + (item.countValue ?? 1), 0);
    return value >= (habit.target.targetCount ?? 1) ? 1 : 0.5;
  }
  if (habit.measurementType === 'boolean') return checkIns.some((item) => item.completed) ? 1 : 0.5;
  return checkIns.some((item) => item.numericValue !== null) ? 1 : 0.5;
}

export function formatClock(minutes: number): string {
  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
}

function aggregateTimes(checkIns: CheckIn[], habitId: string | undefined, buckets: StatisticsBucket[], overnight: boolean): TimePoint[] {
  if (!habitId) return [];
  return buckets.flatMap((bucket, index) => {
    const values = latestPerDay(checkIns.filter((item) => item.habitId === habitId && item.localDate >= bucket.start && item.localDate <= bucket.end))
      .map((item) => timeToMinutes(item.recordedTime, overnight)).filter((value): value is number => value !== null);
    return values.length ? [{ label: bucket.label, value: average(values), position: normalizedPosition(index, buckets.length) }] : [];
  });
}

function aggregateWeights(checkIns: CheckIn[], habitId: string | undefined, buckets: StatisticsBucket[]): WeightPoint[] {
  if (!habitId) return [];
  return buckets.flatMap((bucket, index) => {
    const values = latestPerDay(checkIns.filter((item) => item.habitId === habitId && item.localDate >= bucket.start && item.localDate <= bucket.end && item.numericValue !== null))
      .map((item) => item.numericValue as number);
    return values.length ? [{ label: bucket.label, value: average(values), position: normalizedPosition(index, buckets.length) }] : [];
  });
}

function latestPerDay(checkIns: CheckIn[]): CheckIn[] {
  const latest = new Map<string, CheckIn>();
  for (const item of checkIns) {
    const previous = latest.get(item.localDate);
    if (!previous || item.updatedAt > previous.updatedAt || (item.updatedAt === previous.updatedAt && item.occurredAt > previous.occurredAt)) {
      latest.set(item.localDate, item);
    }
  }
  return [...latest.values()].sort((a, b) => a.localDate.localeCompare(b.localDate));
}

function timeToMinutes(value: string | null, overnight: boolean): number | null {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  const result = (hour ?? 0) * 60 + (minute ?? 0);
  return overnight && result < 12 * 60 ? result + 24 * 60 : result;
}

function average(values: number[]): number { return values.reduce((sum, value) => sum + value, 0) / values.length; }
function normalizedPosition(index: number, count: number): number { return count <= 1 ? 0.5 : index / (count - 1); }
function shortDate(value: string): string { return `${Number(value.slice(5, 7))}/${Number(value.slice(8, 10))}`; }
function monthBucket(year: number, month: number): StatisticsBucket {
  return { start: toLocalDate(new Date(year, month, 1, 12)), end: toLocalDate(new Date(year, month + 1, 0, 12)), label: `${month + 1}月` };
}
