export function fallbackWorkoutTitle(activityType: string, note: string): string {
  const firstSentence = note.replace(/\s+/g, ' ').trim().split(/[。！？!?；;]/)[0]?.trim() ?? '';
  if (firstSentence) return firstSentence.length > 22 ? `${firstSentence.slice(0, 22)}…` : firstSentence;
  return activityType.trim() ? `${activityType.trim()}后的记录` : '今天的运动记录';
}

export function isRichWorkout(photoCount: number, note: string): boolean {
  return photoCount > 0 || Boolean(note.trim());
}
