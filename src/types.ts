export type TabKey = 'today' | 'inbox' | 'week' | 'more';

export type CategoryId =
  | 'study'
  | 'work'
  | 'personal'
  | 'health'
  | 'routine'
  | 'reminder';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  categoryId: CategoryId;
  energyLevel: EnergyLevel;
  startHour?: number;
  startMinute?: number;
  durationMinutes?: number;
  date: string;
  notes?: string;
  completed: boolean;
  isAllDay?: boolean;
  inInbox?: boolean;
};

export type Theme = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textSoft: string;
  textMuted: string;
  border: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  shadow: string;
  timelineLine: string;
  inputFill: string;
};

export type CategoryDefinition = {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
  softColor: string;
};

export type EditorState = {
  id?: string;
  title: string;
  categoryId: CategoryId;
  energyLevel: EnergyLevel;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  notes: string;
  isAllDay: boolean;
  inInbox: boolean;
};
