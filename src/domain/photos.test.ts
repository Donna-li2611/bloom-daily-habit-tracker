import { describe, expect, it } from 'vitest';
import { MAX_PHOTOS, mergePickedPhotos } from './photos';

describe('打卡图片选择', () => {
  it('最多保留九张并维持选择顺序', () => {
    const values = mergePickedPhotos(['first'], Array.from({ length: 12 }, (_, index) => `new-${index}`));
    expect(values).toHaveLength(MAX_PHOTOS);
    expect(values[0]).toBe('first');
    expect(values[8]).toBe('new-7');
  });
});

