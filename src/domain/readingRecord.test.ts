import { describe, expect, it } from 'vitest';
import { mergePhotoTexts, readingRecordHasContent } from './readingRecord';

describe('阅读富内容记录', () => {
  it('按图片顺序合并并跳过空白原文', () => {
    expect(mergePhotoTexts([' 第一页 ', '', '第三页'])).toBe('第一页\n\n第三页');
  });

  it('图片或文字任一存在即属于记录', () => {
    expect(readingRecordHasContent({ photoCount: 1, originalText: '', reflectionText: '', title: '' })).toBe(true);
    expect(readingRecordHasContent({ photoCount: 0, originalText: '', reflectionText: '感悟', title: '' })).toBe(true);
    expect(readingRecordHasContent({ photoCount: 0, originalText: '', reflectionText: '', title: '' })).toBe(false);
  });
});
