import { describe, expect, it } from 'vitest';
import { fallbackDreamTitle } from './dreamRecord';

describe('梦境标题兜底', () => {
  it('从梦境第一句生成可读标题', () => {
    expect(fallbackDreamTitle('我梦见一座山。后来天亮了。')).toBe('我梦见一座山');
  });

  it('限制过长标题并处理空内容', () => {
    expect(fallbackDreamTitle('')).toBe('昨夜的梦');
    expect(fallbackDreamTitle('这是一段特别特别特别特别特别特别特别特别特别特别长的梦境描述')).toHaveLength(23);
  });
});
