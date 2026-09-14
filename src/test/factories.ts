import type { CheckIn, HabitWithTarget } from '@/domain/models';

export function habit(overrides: Partial<HabitWithTarget> = {}): HabitWithTarget {
  const id = overrides.id ?? '10000000-0000-4000-8000-000000000001';
  return {
    id, semanticKey: null, displayOrder: 0, name: '测试习惯', category: '测试', measurementType: 'boolean', status: 'active', unit: null,
    colorKey: null, iconKey: null, notesEnabled: true, photosEnabled: false, healthMetric: null,
    createdAt: '2026-07-01T00:00:00.000Z', updatedAt: '2026-07-01T00:00:00.000Z', archivedAt: null,
    target: { id: '20000000-0000-4000-8000-000000000001', habitId: id, period: 'day', targetCount: 1,
      targetMinutes: null, targetNumber: null, targetMin: null, targetMax: null, targetTime: null,
      targetTimeEnd: null, timeRule: null, selectedWeekdays: null, intervalDays: null, startsOn: '2026-01-01', endsOn: null },
    ...overrides,
  };
}

export function checkIn(overrides: Partial<CheckIn> = {}): CheckIn {
  return {
    id: '30000000-0000-4000-8000-000000000001', habitId: '10000000-0000-4000-8000-000000000001',
    occurredAt: '2026-07-15T12:00:00.000Z', localDate: '2026-07-15', source: 'manual', completed: true,
    countValue: null, durationMinutes: null, numericValue: null, recordedTime: null, activityType: null,
    note: null, externalRecordId: null, createdAt: '2026-07-15T12:00:00.000Z', updatedAt: '2026-07-15T12:00:00.000Z',
    ...overrides,
  };
}
