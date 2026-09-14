export type HabitMeasurementType = 'boolean' | 'count' | 'duration' | 'number' | 'time';
export type HabitStatus = 'active' | 'paused' | 'archived';
export type TargetPeriod = 'day' | 'week';
export type TimeRule = 'before' | 'after' | 'range';
export type CheckInSource = 'manual' | 'apple_health' | 'mock_health' | 'import';
export type HealthMetricType = 'workout' | 'sleep' | 'weight' | 'body_fat' | 'steps';

export interface Habit {
  id: string;
  semanticKey: string | null;
  displayOrder: number;
  name: string;
  category: string;
  measurementType: HabitMeasurementType;
  status: HabitStatus;
  unit: string | null;
  colorKey: string | null;
  iconKey: string | null;
  notesEnabled: boolean;
  photosEnabled: boolean;
  healthMetric: HealthMetricType | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface HabitTarget {
  id: string;
  habitId: string;
  period: TargetPeriod;
  targetCount: number | null;
  targetMinutes: number | null;
  targetNumber: number | null;
  targetMin: number | null;
  targetMax: number | null;
  targetTime: string | null;
  targetTimeEnd: string | null;
  timeRule: TimeRule | null;
  selectedWeekdays: number[] | null;
  intervalDays: number | null;
  startsOn: string;
  endsOn: string | null;
}

export interface HabitWithTarget extends Habit {
  target: HabitTarget;
}

export interface CheckIn {
  id: string;
  habitId: string;
  occurredAt: string;
  localDate: string;
  source: CheckInSource;
  completed: boolean | null;
  countValue: number | null;
  durationMinutes: number | null;
  numericValue: number | null;
  recordedTime: string | null;
  activityType: string | null;
  note: string | null;
  externalRecordId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  checkInId: string;
  kind: 'photo';
  localUri: string;
  createdAt: string;
}

export type RichRecordKind = 'reading' | 'workout' | 'dream';

export interface RichRecord {
  id: string;
  checkInId: string;
  kind: RichRecordKind;
  title: string;
  originalText: string | null;
  reflectionText: string | null;
  interpretationText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RichRecordDraft {
  kind: RichRecordKind;
  title: string;
  originalText: string | null;
  reflectionText: string | null;
  interpretationText: string | null;
  photoTexts: string[];
}

export interface HealthRecord {
  id: string;
  provider: 'apple_health' | 'mock_health';
  metricType: HealthMetricType;
  externalRecordId: string;
  startAt: string;
  endAt: string | null;
  numericValue: number | null;
  unit: string | null;
  metadataJson: string | null;
  importedAt: string;
  status: 'new' | 'confirmed' | 'dismissed';
  linkedCheckInId: string | null;
}

export type HealthRecordImport = Omit<HealthRecord, 'id' | 'importedAt' | 'status' | 'linkedCheckInId'>;

export interface ReviewReflection {
  id: string;
  periodType: 'week' | 'month';
  periodStart: string;
  periodEnd: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitDraft {
  name: string;
  category: string;
  iconKey: string;
  measurementType: HabitMeasurementType;
  unit: string | null;
  notesEnabled: boolean;
  photosEnabled: boolean;
  period: TargetPeriod;
  targetCount: number | null;
  targetMinutes: number | null;
  targetNumber: number | null;
  targetTime: string | null;
  timeRule: TimeRule | null;
  selectedWeekdays: number[] | null;
  intervalDays: number | null;
}

export interface CheckInDraft {
  habitId: string;
  occurredAt: string;
  localDate: string;
  source: CheckInSource;
  completed: boolean | null;
  countValue: number | null;
  durationMinutes: number | null;
  numericValue: number | null;
  recordedTime: string | null;
  activityType: string | null;
  note: string | null;
  externalRecordId: string | null;
}
