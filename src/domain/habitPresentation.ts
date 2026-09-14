import type { CheckIn, HabitWithTarget } from './models';

const icons: Record<string, string> = {
  sleep: '🌙', wake: '🌅', workout: '👟', reading: '📖', weight: '⚖️', footbath: '🛁', dream_journal: '☁️',
};

export function habitIcon(habit: HabitWithTarget): string {
  return icons[habit.semanticKey ?? ''] ?? '🌱';
}

export function habitPlan(habit: HabitWithTarget): string {
  if (habit.measurementType === 'time') return `${habit.target.targetTime ?? '—'} 前`;
  if (habit.semanticKey === 'workout') return `${habit.target.targetCount ?? 0} 次 · ${habit.target.targetMinutes ?? 0} 分钟`;
  if (habit.measurementType === 'duration') return `${habit.target.targetMinutes ?? 0} 分钟`;
  if (habit.measurementType === 'count') return `${habit.target.targetCount ?? 0} 次`;
  if (habit.measurementType === 'number') return '每天记录';
  return habit.target.period === 'week' ? `每周 ${habit.target.targetCount ?? 1} 次` : '完成一次';
}

export function habitFrequencyLabel(habit: HabitWithTarget): string {
  if (habit.target.period === 'week') return `每周${habit.target.targetCount ?? 1}次`;
  if (habit.target.selectedWeekdays?.length) return `每周指定${habit.target.selectedWeekdays.length}天`;
  if (habit.target.intervalDays && habit.target.intervalDays > 1) return `每隔${habit.target.intervalDays}天`;
  return '每日';
}

export function habitActual(habit: HabitWithTarget, records: CheckIn[]): string {
  if (!records.length) return '—';
  const latest = [...records].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (habit.measurementType === 'time') return latest?.recordedTime ?? '—';
  if (habit.semanticKey === 'workout') {
    const minutes = records.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
    return `${records.length} 次${minutes ? ` · ${minutes} 分钟` : ''}`;
  }
  if (habit.measurementType === 'duration') {
    const minutes = records.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
    const pages = records.reduce((sum, item) => sum + (item.numericValue ?? 0), 0);
    return `${minutes} 分钟${pages ? ` · ${pages} 页` : ''}`;
  }
  if (habit.measurementType === 'number') return `${latest?.numericValue ?? '—'}${habit.unit ? ` ${habit.unit}` : ''}`;
  if (habit.measurementType === 'count') return `${records.reduce((sum, item) => sum + (item.countValue ?? 1), 0)} 次`;
  return records.some((item) => item.completed) ? '打卡成功' : '—';
}
