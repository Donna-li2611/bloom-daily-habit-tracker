import type { CheckIn, HabitWithTarget } from './models';
import { dateRange, endOfWeek, fromLocalDate, startOfWeek } from '@/utils/date';

export interface HabitProgress {
  value: number;
  target: number;
  ratio: number;
  status: 'not_started' | 'partial' | 'completed' | 'exceeded';
  label: string;
}

export function isScheduledOn(habit: HabitWithTarget, localDate: string): boolean {
  if (habit.status !== 'active') return false;
  if (localDate < habit.target.startsOn) return false;
  if (habit.target.endsOn && localDate > habit.target.endsOn) return false;
  if (habit.target.period === 'week') return true;
  if (habit.target.intervalDays && habit.target.intervalDays > 1) {
    const start = fromLocalDate(habit.target.startsOn).getTime();
    const current = fromLocalDate(localDate).getTime();
    return Math.round((current - start) / 86_400_000) % habit.target.intervalDays === 0;
  }
  const weekdays = habit.target.selectedWeekdays;
  return !weekdays?.length || weekdays.includes(fromLocalDate(localDate).getDay());
}

export function evaluateTime(recordedTime: string, targetTime: string, rule: 'before' | 'after' | 'range', targetEnd?: string | null): boolean {
  const toMinutes = (value: string) => {
    const [hour = 0, minute = 0] = value.split(':').map(Number);
    return hour * 60 + minute;
  };
  const recorded = toMinutes(recordedTime);
  const target = toMinutes(targetTime);
  if (rule === 'before') return target >= 18 * 60 && recorded < 12 * 60 ? false : recorded <= target;
  if (rule === 'after') return recorded >= target;
  if (!targetEnd) return false;
  const end = toMinutes(targetEnd);
  return target <= end ? recorded >= target && recorded <= end : recorded >= target || recorded <= end;
}

export function progressForHabit(habit: HabitWithTarget, checkIns: CheckIn[], localDate: string): HabitProgress {
  const start = habit.target.period === 'week' ? startOfWeek(localDate) : localDate;
  const relevant = checkIns.filter((item) => item.habitId === habit.id && item.localDate >= start && item.localDate <= localDate);
  let value = 0;
  let target = 1;
  let suffix = '';

  switch (habit.measurementType) {
    case 'boolean':
      value = habit.target.period === 'week'
        ? relevant.filter((item) => item.completed).length
        : relevant.some((item) => item.completed) ? 1 : 0;
      target = habit.target.targetCount ?? 1;
      suffix = habit.target.period === 'week' ? '次' : '项';
      break;
    case 'count':
      value = relevant.reduce((sum, item) => sum + (item.countValue ?? 1), 0);
      target = habit.target.targetCount ?? 1;
      suffix = '次';
      break;
    case 'duration':
      value = relevant.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
      target = habit.target.targetMinutes ?? 1;
      suffix = '分钟';
      break;
    case 'number':
      value = relevant.some((item) => item.numericValue !== null) ? 1 : 0;
      target = 1;
      suffix = '次记录';
      break;
    case 'time':
      value = latestPerDay(relevant).some((item) => item.recordedTime && habit.target.targetTime && habit.target.timeRule
        ? evaluateTime(item.recordedTime, habit.target.targetTime, habit.target.timeRule, habit.target.targetTimeEnd)
        : item.recordedTime !== null) ? 1 : 0;
      target = 1;
      suffix = '次记录';
      break;
  }

  const ratio = target > 0 ? value / target : 0;
  const status = value === 0 ? 'not_started' : ratio < 1 ? 'partial' : ratio === 1 ? 'completed' : 'exceeded';
  return { value, target, ratio: Math.min(ratio, 1), status, label: `${value} / ${target} ${suffix}` };
}

/**
 * 首页展示的是本周打卡节奏，而不是单次记录里的分钟、页数或体重。
 * 每日习惯按本周实际记录天数计算；每周习惯继续使用自身的周目标。
 */
export function cadenceProgressForHabit(habit: HabitWithTarget, checkIns: CheckIn[], localDate: string): HabitProgress {
  if (habit.target.period === 'week') return progressForHabit(habit, checkIns, localDate);

  const weekStart = startOfWeek(localDate);
  const weekEnd = endOfWeek(localDate);
  const scheduledDates = dateRange(weekStart, weekEnd).filter((date) => isScheduledOn(habit, date));
  const recordedDates = new Set(checkIns
    .filter((item) => item.habitId === habit.id && item.localDate >= weekStart && item.localDate <= localDate && scheduledDates.includes(item.localDate))
    .map((item) => item.localDate));
  const value = recordedDates.size;
  const target = scheduledDates.length;
  const rawRatio = target > 0 ? value / target : 0;
  const status = value === 0 ? 'not_started' : rawRatio < 1 ? 'partial' : rawRatio === 1 ? 'completed' : 'exceeded';
  return { value, target, ratio: Math.min(rawRatio, 1), status, label: `${value} / ${target} 天` };
}

function latestPerDay(checkIns: CheckIn[]): CheckIn[] {
  const latest = new Map<string, CheckIn>();
  for (const item of checkIns) {
    const previous = latest.get(item.localDate);
    if (!previous || item.updatedAt > previous.updatedAt || (item.updatedAt === previous.updatedAt && item.occurredAt > previous.occurredAt)) latest.set(item.localDate, item);
  }
  return [...latest.values()];
}

export function completionRate(habits: HabitWithTarget[], checkIns: CheckIn[], start: string, end: string): { completed: number; opportunities: number; rate: number } {
  let completed = 0;
  let opportunities = 0;
  for (const habit of habits) {
    if (habit.target.period === 'week') {
      opportunities += 1;
      if (progressForHabit(habit, checkIns, end).ratio >= 1) completed += 1;
      continue;
    }
    for (const day of dateRange(start, end)) {
      if (!isScheduledOn(habit, day)) continue;
      opportunities += 1;
      if (progressForHabit(habit, checkIns.filter((item) => item.localDate === day), day).ratio >= 1) completed += 1;
    }
  }
  return { completed, opportunities, rate: opportunities ? completed / opportunities : 0 };
}
