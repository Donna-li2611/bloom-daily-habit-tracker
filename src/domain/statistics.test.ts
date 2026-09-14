import { describe, expect, it } from 'vitest';
import { buildStatistics, formatClock, moveStatisticsAnchor, statisticsWindow, statisticsWindowHint } from './statistics';
import { checkIn, habit } from '@/test/factories';

describe('statistics periods', () => {
  it('creates the required bucket sizes', () => {
    expect(statisticsWindow('week', '2026-08-12').buckets).toHaveLength(7);
    expect(statisticsWindow('month', '2026-07-12').buckets.map((item) => item.label)).toEqual(['1–6', '7–12', '13–18', '19–24', '25–30', '31']);
    expect(statisticsWindow('quarter', '2026-08-12').buckets.map((item) => item.label)).toEqual(['7月', '8月', '9月']);
    expect(statisticsWindow('year', '2026-08-12').buckets).toHaveLength(12);
    expect(moveStatisticsAnchor('quarter', '2026-08-12', -1)).toBe('2026-05-12');
  });

  it('labels only the current window as this week or month', () => {
    expect(statisticsWindowHint('week', statisticsWindow('week', '2026-08-12'), '2026-08-15')).toBe('本周');
    expect(statisticsWindowHint('week', statisticsWindow('week', '2026-08-03'), '2026-08-15')).toBe('所选周');
    expect(statisticsWindowHint('month', statisticsWindow('month', '2026-07-12'), '2026-08-15')).toBe('所选月份');
    expect(statisticsWindowHint('year', statisticsWindow('year', '2026-08-12'), '2026-08-15')).toBe('今年');
  });

  it('aggregates actual SQLite-shaped records and uses edited targets', () => {
    const wake = habit({ id: 'wake', semanticKey: 'wake', measurementType: 'time', target: { ...habit().target, habitId: 'wake', targetTime: '06:45', timeRule: 'before' } });
    const sleep = habit({ id: 'sleep', semanticKey: 'sleep', measurementType: 'time', target: { ...habit().target, habitId: 'sleep', targetTime: '23:00', timeRule: 'before' } });
    const weight = habit({ id: 'weight', semanticKey: 'weight', measurementType: 'number', unit: 'kg', target: { ...habit().target, habitId: 'weight' } });
    const window = statisticsWindow('week', '2026-08-12');
    const result = buildStatistics([wake, sleep, weight], [
      checkIn({ id: '1', habitId: 'wake', localDate: '2026-08-10', recordedTime: '06:40' }),
      checkIn({ id: '2', habitId: 'sleep', localDate: '2026-08-10', recordedTime: '23:10' }),
      checkIn({ id: '3', habitId: 'weight', localDate: '2026-08-10', numericValue: 60.5 }),
      checkIn({ id: '4', habitId: 'weight', localDate: '2026-08-11', numericValue: 60.2 }),
    ], window, '2026-08-12');
    expect(formatClock(result.wake.target ?? 0)).toBe('06:45');
    expect(formatClock(result.sleep.target ?? 0)).toBe('23:00');
    expect(result.weight).toMatchObject({ latest: 60.2, change: -0.29999999999999716 });
    expect(result.wake.points[0]?.position).toBe(0);
    expect(result.weight.points[1]?.position).toBeCloseTo(1 / 6);
    expect(result.matrix.find((row) => row.habitId === 'sleep')?.cells[0]?.ratio).toBe(0.5);
  });

  it('uses the latest same-day time record instead of averaging stale duplicates', () => {
    const wake = habit({ id: 'wake', semanticKey: 'wake', measurementType: 'time', target: { ...habit().target, habitId: 'wake', targetTime: '07:00', timeRule: 'before' } });
    const window = statisticsWindow('week', '2026-08-12');
    const result = buildStatistics([wake], [
      checkIn({ id: 'old', habitId: 'wake', localDate: '2026-08-10', recordedTime: '06:50', updatedAt: '2026-08-10T01:00:00.000Z' }),
      checkIn({ id: 'new', habitId: 'wake', localDate: '2026-08-10', recordedTime: '08:00', updatedAt: '2026-08-12T01:00:00.000Z' }),
    ], window, '2026-08-12');
    expect(result.wake.points[0]?.value).toBe(8 * 60);
    expect(formatClock(result.wake.points[0]?.value ?? 0)).toBe('08:00');
    expect(result.matrix.find((row) => row.habitId === 'wake')?.cells[0]?.ratio).toBe(0.5);
  });

  it('marks late wake and after-midnight sleep records as recorded but not on plan', () => {
    const wake = habit({ id: 'wake', semanticKey: 'wake', measurementType: 'time', target: { ...habit().target, habitId: 'wake', targetTime: '07:00', timeRule: 'before' } });
    const sleep = habit({ id: 'sleep', semanticKey: 'sleep', measurementType: 'time', target: { ...habit().target, habitId: 'sleep', targetTime: '23:30', timeRule: 'before' } });
    const window = statisticsWindow('week', '2026-08-12');
    const result = buildStatistics([wake, sleep], [
      checkIn({ id: 'wake-late', habitId: 'wake', localDate: '2026-08-10', recordedTime: '08:00' }),
      checkIn({ id: 'sleep-late', habitId: 'sleep', localDate: '2026-08-10', recordedTime: '00:31' }),
    ], window, '2026-08-12');
    expect(result.matrix.find((row) => row.habitId === 'wake')?.cells[0]?.ratio).toBe(0.5);
    expect(result.matrix.find((row) => row.habitId === 'sleep')?.cells[0]?.ratio).toBe(0.5);
  });
});
