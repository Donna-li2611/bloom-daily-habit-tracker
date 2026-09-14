export function fallbackDreamTitle(dreamText: string): string {
  const firstSentence = dreamText.replace(/\s+/g, ' ').trim().split(/[。！？!?；;]/)[0]?.trim() ?? '';
  if (!firstSentence) return '昨夜的梦';
  return firstSentence.length > 22 ? `${firstSentence.slice(0, 22)}…` : firstSentence;
}
