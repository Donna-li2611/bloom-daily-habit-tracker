import { describe, expect, it } from 'vitest';
import { cadenceProgressForHabit, completionRate, evaluateTime, isScheduledOn, progressForHabit } from './progress';
import { checkIn, habit } from '@/test/factories';

describe('习惯进度', () => {
  it('只在选定的工作日安排每日习惯', () => {
    const mondayOnly = habit({ target: { ...habit().target, selectedWeekdays: [1] } });
    expect(isScheduledOn(mondayOnly, '2026-07-13')).toBe(true);
    expect(isScheduledOn(mondayOnly, '2026-07-14')).toBe(false);
  });

  it('累加每周次数和时长', () => {
    const exercise = habit({ measurementType: 'count', target: { ...habit().target, period: 'week', targetCount: 3 } });
    const records = [checkIn({ countValue: 1, localDate: '2026-07-13' }), checkIn({ id: 'second', countValue: 2, localDate: '2026-07-15' })];
    expect(progressForHabit(exercise, records, '2026-07-16')).toMatchObject({ value: 3, target: 3, status: 'completed' });
  });

  it('首页每日习惯按本周记录天数显示，而不是按分钟目标显示', () => {
    const reading = habit({ semanticKey: 'reading', measurementType: 'duration', target: { ...habit().target, targetMinutes: 30 } });
    const records = [checkIn({ localDate: '2026-08-17', durationMinutes: 120, numericValue: 20 })];
    expect(cadenceProgressForHabit(reading, records, '2026-08-17')).toMatchObject({ value: 1, target: 7, ratio: 1 / 7 });
  });

  it('首页每周习惯仍按配置的每周次数显示', () => {
    const workout = habit({ measurementType: 'count', target: { ...habit().target, period: 'week', targetCount: 3 } });
    expect(cadenceProgressForHabit(workout, [checkIn({ countValue: 1 })], '2026-07-15')).toMatchObject({ value: 1, target: 3 });
  });

  it('每周目标在完成率中只计算一次', () => {
    const weekly = habit({ measurementType: 'count', target: { ...habit().target, period: 'week', targetCount: 3 } });
    const result = completionRate([weekly], [checkIn({ countValue: 3 })], '2026-07-13', '2026-07-19');
    expect(result).toEqual({ completed: 1, opportunities: 1, rate: 1 });
  });

  it('每周完成型目标按实际打卡次数累计', () => {
    const weeklyBoolean = habit({ target: { ...habit().target, period: 'week', targetCount: 2 } });
    const records = [checkIn({ localDate: '2026-07-13' }), checkIn({ id: 'second', localDate: '2026-07-15' })];
    expect(progressForHabit(weeklyBoolean, records, '2026-07-16')).toMatchObject({ value: 2, target: 2, status: 'completed' });
  });

  it('查看历史日期时不计入之后补录的记录', () => {
    const weekly = habit({ measurementType: 'count', target: { ...habit().target, period: 'week', targetCount: 3 } });
    const records = [
      checkIn({ localDate: '2026-07-13', countValue: 1 }),
      checkIn({ id: 'future', localDate: '2026-07-17', countValue: 2 }),
    ];
    expect(progressForHabit(weekly, records, '2026-07-15')).toMatchObject({ value: 1, target: 3, status: 'partial' });
  });

  it('支持跨午夜的时间范围', () => {
    expect(evaluateTime('23:45', '22:00', 'range', '01:00')).toBe(true);
    expect(evaluateTime('00:30', '22:00', 'range', '01:00')).toBe(true);
    expect(evaluateTime('14:00', '22:00', 'range', '01:00')).toBe(false);
  });

  it('凌晨记录不会误判为按时睡觉', () => {
    expect(evaluateTime('00:30', '23:30', 'before')).toBe(false);
    expect(evaluateTime('23:15', '23:30', 'before')).toBe(true);
  });

  it('同日时间修改后只按最后修改的记录判断是否达标', () => {
    const wake = habit({ measurementType: 'time', target: { ...habit().target, targetTime: '07:00', timeRule: 'before' } });
    const records = [
      checkIn({ id: 'old', localDate: '2026-08-10', recordedTime: '06:50', updatedAt: '2026-08-10T01:00:00.000Z' }),
      checkIn({ id: 'new', localDate: '2026-08-10', recordedTime: '08:00', updatedAt: '2026-08-12T01:00:00.000Z' }),
    ];
    expect(progressForHabit(wake, records, '2026-08-10')).toMatchObject({ value: 0, status: 'not_started' });
  });
});
