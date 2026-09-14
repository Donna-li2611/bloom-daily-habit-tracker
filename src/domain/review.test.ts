import { describe, expect, it } from 'vitest';
import { buildReview } from './review';
import { checkIn, habit } from '@/test/factories';

describe('复盘汇总', () => {
  it('汇总运动、阅读和体重趋势', () => {
    const exercise = habit({ id: 'exercise', name: '每周运动3次', category: '运动', measurementType: 'count', target: { ...habit().target, habitId: 'exercise', period: 'week', targetCount: 3 } });
    const reading = habit({ id: 'reading', name: '阅读30分钟', category: '学习', measurementType: 'duration', target: { ...habit().target, habitId: 'reading', targetMinutes: 30 } });
    const weight = habit({ id: 'weight', name: '每天记录体重', category: '健康', measurementType: 'number', unit: 'kg', target: { ...habit().target, habitId: 'weight' } });
    const records = [
      checkIn({ id: 'e1', habitId: 'exercise', localDate: '2026-07-13', countValue: 1, durationMinutes: 40 }),
      checkIn({ id: 'e2', habitId: 'exercise', localDate: '2026-07-15', countValue: 1, durationMinutes: 50 }),
      checkIn({ id: 'r1', habitId: 'reading', localDate: '2026-07-14', durationMinutes: 35, numericValue: 20 }),
      checkIn({ id: 'w1', habitId: 'weight', localDate: '2026-07-13', numericValue: 60.5 }),
      checkIn({ id: 'w2', habitId: 'weight', localDate: '2026-07-19', numericValue: 60.1 }),
    ];
    const review = buildReview([exercise, reading, weight], records, '2026-07-19');
    expect(review.exercise).toEqual({ sessions: 2, minutes: 90 });
    expect(review.reading).toEqual({ minutes: 35, pages: 20 });
    expect(review.weight.latest).toBe(60.1);
    expect(review.weight.change).toBeCloseTo(-0.4);
  });

  it('空数据不会产生除零错误', () => {
    const review = buildReview([], [], '2026-07-19');
    expect(review.sevenDay.rate).toBe(0);
    expect(review.weight.latest).toBeNull();
  });
});

