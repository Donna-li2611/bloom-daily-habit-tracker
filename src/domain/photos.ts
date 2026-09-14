export const MAX_PHOTOS = 9;

export function mergePickedPhotos(current: string[], picked: string[]): string[] {
  return [...current, ...picked].slice(0, MAX_PHOTOS);
}

