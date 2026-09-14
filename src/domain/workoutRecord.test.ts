import { describe, expect, it } from 'vitest';
import { fallbackWorkoutTitle, isRichWorkout } from './workoutRecord';

describe('运动富内容记录', () => {
  it('只有图片或文字才进入记录', () => {
    expect(isRichWorkout(0, '')).toBe(false);
    expect(isRichWorkout(1, '')).toBe(true);
    expect(isRichWorkout(0, '身体很轻松')).toBe(true);
  });

  it('优先用文字生成标题，否则使用运动类型', () => {
    expect(fallbackWorkoutTitle('羽毛球', '今天步伐更轻快。')).toBe('今天步伐更轻快');
    expect(fallbackWorkoutTitle('瑜伽', '')).toBe('瑜伽后的记录');
  });
});
