export type HabitNameLocale = 'zh-CN' | 'en';

export interface HabitNameCatalogEntry {
  semanticKey: string;
  zh: string;
  en: string;
  aliases: readonly string[];
}

// This catalog mirrors the vocabulary validated in the PWA. Semantic keys are
// stable business identifiers; names and aliases are presentation/search data.
export const HABIT_NAME_CATALOG: readonly HabitNameCatalogEntry[] = [
  { semanticKey: 'sleep', zh: '睡眠', en: 'Sleep', aliases: ['入睡', '早睡', '按时睡觉', 'go to bed early', 'bedtime'] },
  { semanticKey: 'wake', zh: '起床', en: 'Wake up', aliases: ['早起', '起床时间', '按时起床', 'wake', 'wake up early'] },
  { semanticKey: 'workout', zh: '运动', en: 'Workout', aliases: ['锻炼', '健身', '训练', 'exercise', 'fitness'] },
  { semanticKey: 'reading', zh: '阅读', en: 'Reading', aliases: ['读书', '看书', 'read'] },
  { semanticKey: 'weight', zh: '体重记录', en: 'Weight tracking', aliases: ['体重', '记录体重', '称重', '称体重', 'weight', 'weight log', 'track weight'] },
  { semanticKey: 'footbath', zh: '泡脚', en: 'Foot soak', aliases: ['足浴', 'foot bath'] },
  { semanticKey: 'dream_journal', zh: '梦境记录', en: 'Dream journal', aliases: ['记梦', '记录梦境', 'dream log'] },
  { semanticKey: 'running', zh: '跑步', en: 'Running', aliases: ['晨跑', '夜跑', 'run'] },
  { semanticKey: 'walking', zh: '散步', en: 'Walking', aliases: ['走路', '快走', 'walk'] },
  { semanticKey: 'cycling', zh: '骑单车', en: 'Cycling', aliases: ['骑车', '自行车', 'bike'] },
  { semanticKey: 'swimming', zh: '游泳', en: 'Swimming', aliases: ['swim'] },
  { semanticKey: 'yoga', zh: '瑜伽', en: 'Yoga', aliases: [] },
  { semanticKey: 'stretching', zh: '拉伸', en: 'Stretching', aliases: ['伸展', 'stretch'] },
  { semanticKey: 'strength_training', zh: '力量训练', en: 'Strength training', aliases: ['撸铁', 'weight training'] },
  { semanticKey: 'badminton', zh: '羽毛球', en: 'Badminton', aliases: [] },
  { semanticKey: 'table_tennis', zh: '乒乓球', en: 'Table tennis', aliases: ['ping pong'] },
  { semanticKey: 'golf', zh: '高尔夫', en: 'Golf', aliases: [] },
  { semanticKey: 'meditation', zh: '冥想', en: 'Meditation', aliases: ['正念', '静坐', 'meditate', 'mindfulness'] },
  { semanticKey: 'study', zh: '学习', en: 'Study', aliases: ['专注学习', 'learn'] },
  { semanticKey: 'vocabulary', zh: '背单词', en: 'Vocabulary', aliases: ['记单词', 'learn vocabulary'] },
  { semanticKey: 'english', zh: '学英语', en: 'Learn English', aliases: ['英语学习', 'study english'] },
  { semanticKey: 'writing', zh: '写作', en: 'Writing', aliases: ['write'] },
  { semanticKey: 'journaling', zh: '写日记', en: 'Journaling', aliases: ['记日记', 'journal'] },
  { semanticKey: 'reflection', zh: '每日复盘', en: 'Daily reflection', aliases: ['复盘', 'reflection'] },
  { semanticKey: 'drink_water', zh: '喝水', en: 'Drink water', aliases: ['饮水', '补水', 'hydrate'] },
  { semanticKey: 'healthy_eating', zh: '健康饮食', en: 'Healthy eating', aliases: ['控制饮食', 'eat healthy'] },
  { semanticKey: 'take_medication', zh: '服药', en: 'Take medication', aliases: ['吃药', '用药', 'take medicine'] },
  { semanticKey: 'vitamins', zh: '吃维生素', en: 'Take vitamins', aliases: ['维生素', 'vitamins'] },
  { semanticKey: 'sleep_tracking', zh: '记录睡眠', en: 'Track sleep', aliases: ['睡眠记录', 'sleep log'] },
  { semanticKey: 'tidy_up', zh: '整理房间', en: 'Tidy up', aliases: ['收拾房间', 'clean room'] },
  { semanticKey: 'skincare', zh: '护肤', en: 'Skincare', aliases: ['skin care'] },
  { semanticKey: 'oral_care', zh: '口腔护理', en: 'Oral care', aliases: ['刷牙', '牙线', 'brush my teeth', 'floss'] },
  { semanticKey: 'daily_planning', zh: '今日计划', en: 'Daily planning', aliases: ['每日计划', 'daily plan'] },
  { semanticKey: 'expense_tracking', zh: '记账', en: 'Expense tracking', aliases: ['记录开支', 'track expenses'] },
  { semanticKey: 'mood_journal', zh: '心情记录', en: 'Mood journal', aliases: ['记录心情', 'mood log'] },
  { semanticKey: 'gratitude', zh: '感恩记录', en: 'Gratitude journal', aliases: ['感恩日记', 'gratitude journal'] },
];

export function normalizeHabitName(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[\s_-]+/g, ' ');
}

export function resolveHabitName(value: string): HabitNameCatalogEntry | null {
  const normalized = normalizeHabitName(value);
  if (!normalized) return null;
  const exact = HABIT_NAME_CATALOG.find((entry) => [entry.zh, entry.en, ...entry.aliases]
    .some((candidate) => normalizeHabitName(candidate) === normalized));
  if (exact) return exact;
  const partial = HABIT_NAME_CATALOG.flatMap((entry) => [entry.zh, entry.en, ...entry.aliases]
    .map((candidate) => ({ entry, keyword: normalizeHabitName(candidate) })))
    .filter(({ keyword }) => keyword.length > 1 && normalized.includes(keyword))
    .sort((left, right) => right.keyword.length - left.keyword.length);
  return partial[0]?.entry ?? null;
}

export function localizedHabitName(semanticKey: string | null, originalName: string, locale: HabitNameLocale): string {
  if (!semanticKey) return originalName;
  const entry = HABIT_NAME_CATALOG.find((candidate) => candidate.semanticKey === semanticKey);
  return entry ? (locale === 'en' ? entry.en : entry.zh) : originalName;
}
