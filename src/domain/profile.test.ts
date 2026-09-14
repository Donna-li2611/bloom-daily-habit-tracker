import { describe, expect, it } from 'vitest';
import { displayNameValidationError, normalizeDisplayName } from './profile';

describe('本地个人称呼', () => {
  it('清理首尾与重复空格，但保留用户选择的文字', () => {
    expect(normalizeDisplayName('  Donna   Li  ')).toBe('Donna Li');
    expect(normalizeDisplayName(' 小李 ')).toBe('小李');
  });

  it('不接受空称呼或超过二十个字符的称呼', () => {
    expect(displayNameValidationError('   ')).toContain('请输入');
    expect(displayNameValidationError('一'.repeat(21))).toContain('20');
    expect(displayNameValidationError('Alex')).toBeNull();
  });
});
