import { describe, expect, it } from 'vitest';
import { HABIT_NAME_CATALOG, localizedHabitName, normalizeHabitName, resolveHabitName } from './habitNames';

describe('习惯中英文名称目录', () => {
  it('包含 PWA 已验证的初始习惯和常用习惯', () => {
    expect(HABIT_NAME_CATALOG.length).toBeGreaterThanOrEqual(35);
    expect(resolveHabitName('睡眠')?.en).toBe('Sleep');
    expect(resolveHabitName('wake up')?.semanticKey).toBe('wake');
    expect(resolveHabitName('记录体重')?.semanticKey).toBe('weight');
    expect(resolveHabitName('mindfulness')?.zh).toBe('冥想');
  });

  it('忽略大小写、空格、下划线和中划线', () => {
    expect(normalizeHabitName('  Strength_Training ')).toBe('strength training');
    expect(resolveHabitName('STRENGTH-TRAINING')?.semanticKey).toBe('strength_training');
  });

  it('可识别包含习惯词的自然输入', () => {
    expect(resolveHabitName('每天坚持读书 30 分钟')?.semanticKey).toBe('reading');
    expect(resolveHabitName('morning yoga practice')?.semanticKey).toBe('yoga');
  });

  it('未匹配时保留用户原始名称', () => {
    expect(resolveHabitName('照顾阳台植物')).toBeNull();
    expect(localizedHabitName(null, '照顾阳台植物', 'en')).toBe('照顾阳台植物');
  });

  it('可通过稳定语义键读取两种显示名称', () => {
    expect(localizedHabitName('reading', '自定义阅读', 'zh-CN')).toBe('阅读');
    expect(localizedHabitName('reading', '自定义阅读', 'en')).toBe('Reading');
  });
});
