export function mergePhotoTexts(photoTexts: string[]): string {
  return photoTexts.map((text) => text.trim()).filter(Boolean).join('\n\n');
}

export function readingRecordHasContent(input: { photoCount: number; originalText: string; reflectionText: string; title: string }): boolean {
  return input.photoCount > 0 || Boolean(input.originalText.trim() || input.reflectionText.trim() || input.title.trim());
}
