import { describe, expect, it } from 'vitest';
import { formatChineseDateWithWeekday, occurredAtForLocalDate, toLocalDate } from './date';

describe('补打卡发生时间', () => {
  it('今天使用当前时间', () => {
    const now = new Date(2026, 7, 12, 9, 30, 15);
    expect(occurredAtForLocalDate(toLocalDate(now), now)).toBe(now.toISOString());
  });

  it('历史日期使用当地正午，避免 UTC 时区改变所属日期', () => {
    const occurredAt = occurredAtForLocalDate('2026-08-10', new Date(2026, 7, 12, 9, 30));
    expect(toLocalDate(new Date(occurredAt))).toBe('2026-08-10');
    expect(new Date(occurredAt).getHours()).toBe(12);
  });

  it('中文日期只显示一个日字', () => {
    expect(formatChineseDateWithWeekday('2026-08-11')).toBe('8月11日 星期二');
    expect(formatChineseDateWithWeekday('2026-08-12')).toBe('8月12日 星期三');
  });
});
