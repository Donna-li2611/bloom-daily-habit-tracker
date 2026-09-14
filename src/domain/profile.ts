export const DISPLAY_NAME_MAX_LENGTH = 20;

export function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function displayNameValidationError(value: string): string | null {
  const normalized = normalizeDisplayName(value);
  if (!normalized) return '请输入希望 Bloom 称呼你的名字。';
  if (Array.from(normalized).length > DISPLAY_NAME_MAX_LENGTH) return `称呼最多 ${DISPLAY_NAME_MAX_LENGTH} 个字符。`;
  return null;
}
