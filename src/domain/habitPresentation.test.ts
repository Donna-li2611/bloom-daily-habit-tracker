import { describe, expect, it } from 'vitest';
import { habitActual, habitFrequencyLabel, habitPlan } from './habitPresentation';
import { checkIn, habit } from '@/test/factories';

describe('今天习惯文案', () => {
  it('未打卡时实际值为空', () => {
    expect(habitActual(habit(), [])).toBe('—');
  });

  it('阅读同时展示分钟和页数', () => {
    const reading = habit({ semanticKey: 'reading', measurementType: 'duration', target: { ...habit().target, targetMinutes: 30 } });
    expect(habitPlan(reading)).toBe('30 分钟');
    expect(habitActual(reading, [checkIn({ durationMinutes: 18, numericValue: 12 })])).toBe('18 分钟 · 12 页');
  });

  it('运动汇总本周次数和分钟', () => {
    const workout = habit({ semanticKey: 'workout', measurementType: 'count', target: { ...habit().target, period: 'week', targetCount: 3, targetMinutes: 150 } });
    expect(habitActual(workout, [checkIn({ durationMinutes: 45 }), checkIn({ id: 'two', durationMinutes: 30 })])).toBe('2 次 · 75 分钟');
  });

  it('设置页明确显示每周次数', () => {
    const workout = habit({ target: { ...habit().target, period: 'week', targetCount: 3 } });
    expect(habitFrequencyLabel(workout)).toBe('每周3次');
    expect(habitFrequencyLabel(habit())).toBe('每日');
  });

  it('时间和体重同日修改后显示最后修改值', () => {
    const wake = habit({ measurementType: 'time' });
    const records = [
      checkIn({ id: 'old', recordedTime: '06:50', numericValue: 70, updatedAt: '2026-08-10T01:00:00.000Z' }),
      checkIn({ id: 'new', recordedTime: '08:00', numericValue: 56, updatedAt: '2026-08-12T01:00:00.000Z' }),
    ];
    expect(habitActual(wake, records)).toBe('08:00');
    expect(habitActual(habit({ measurementType: 'number', unit: 'kg' }), records)).toBe('56 kg');
  });
});
