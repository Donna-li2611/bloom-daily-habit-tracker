import type { CheckIn, HabitWithTarget } from './models';
import { completionRate, progressForHabit } from './progress';
import { addDays, startOfWeek } from '@/utils/date';

export interface HabitReviewRow { habitId: string; name: string; progress: string; ratio: number }
export interface WeightPoint { date: string; value: number }
export interface ReviewSummary {
  sevenDay: ReturnType<typeof completionRate>;
  habits: HabitReviewRow[];
  exercise: { sessions: number; minutes: number };
  reading: { minutes: number; pages: number };
  weight: { latest: number | null; change: number | null; points: WeightPoint[] };
  narrative: string;
}

export function buildReview(habits: HabitWithTarget[], checkIns: CheckIn[], today: string): ReviewSummary {
  const sevenDayStart = addDays(today, -6);
  const weekStart = startOfWeek(today);
  const sevenDayRecords = checkIns.filter((item) => item.localDate >= sevenDayStart && item.localDate <= today);
  const weekRecords = checkIns.filter((item) => item.localDate >= weekStart && item.localDate <= today);
  const sevenDay = completionRate(habits.filter((habit) => habit.status !== 'archived'), sevenDayRecords, sevenDayStart, today);
  const habitRows = habits.filter((habit) => habit.status !== 'archived').map((habit) => {
    const progress = progressForHabit(habit, weekRecords, today);
    return { habitId: habit.id, name: habit.name, progress: progress.label, ratio: progress.ratio };
  });
  const exerciseIds = new Set(habits.filter((habit) => habit.category === '运动').map((habit) => habit.id));
  const exerciseRecords = weekRecords.filter((item) => exerciseIds.has(item.habitId));
  const readingIds = new Set(habits.filter((habit) => habit.name.includes('阅读')).map((habit) => habit.id));
  const readingRecords = weekRecords.filter((item) => readingIds.has(item.habitId));
  const weightIds = new Set(habits.filter((habit) => habit.name.includes('体重') || (habit.measurementType === 'number' && habit.unit === 'kg')).map((habit) => habit.id));
  const points = sevenDayRecords.filter((item) => weightIds.has(item.habitId) && item.numericValue !== null)
    .map((item) => ({ date: item.localDate, value: item.numericValue as number })).sort((a, b) => a.date.localeCompare(b.date));
  const latest = points.at(-1)?.value ?? null;
  const change = latest !== null && points.length > 1 ? latest - (points[0]?.value ?? latest) : null;
  const exercise = {
    sessions: exerciseRecords.reduce((sum, item) => sum + (item.countValue ?? 1), 0),
    minutes: exerciseRecords.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0),
  };
  const reading = {
    minutes: readingRecords.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0),
    pages: readingRecords.reduce((sum, item) => sum + (item.numericValue ?? 0), 0),
  };
  const achieved = habitRows.filter((item) => item.ratio >= 1).length;
  const narrative = sevenDay.opportunities === 0
    ? '开始记录后，这里会生成一段客观的每周小结。'
    : `最近7天完成了 ${sevenDay.completed} / ${sevenDay.opportunities} 个计划机会。本周已有 ${achieved} 个习惯达到目标。${exercise.sessions ? `运动 ${exercise.sessions} 次，共 ${exercise.minutes} 分钟。` : '本周还可以安排一次轻松的运动。'}`;
  return { sevenDay, habits: habitRows, exercise, reading, weight: { latest, change, points }, narrative };
}

