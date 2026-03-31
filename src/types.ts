export type TabKey = 'today' | 'inbox' | 'week' | 'more';
export type UserType = 'student' | 'professional' | 'freelancer' | 'routine';
export type WeekStartsOn = 'monday' | 'sunday';

export type CategoryId =
  | 'study'
  | 'work'
  | 'personal'
  | 'health'
  | 'routine'
  | 'reminder';

export type EnergyLevel = 'low' | 'medium' | 'high';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  categoryId: CategoryId;
  energyLevel: EnergyLevel;
  priority: PriorityLevel;
  startHour?: number;
  startMinute?: number;
  durationMinutes?: number;
  reminderMinutesBefore?: number | null;
  date: string;
  notes?: string;
  subtasks: Subtask[];
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
  priority: PriorityLevel;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  reminderMinutesBefore: number | null;
  notes: string;
  subtasks: Subtask[];
  isAllDay: boolean;
  inInbox: boolean;
};

export type PlannerProfile = {
  userType: UserType;
  dayStartHour: number;
  dayEndHour: number;
  defaultDurationMinutes: number;
  defaultReminderMinutes: number | null;
  notificationsEnabled: boolean;
  weekStartsOn: WeekStartsOn;
};

export type FocusSession = {
  id: string;
  taskId: string;
  taskTitle: string;
  date: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  completed: boolean;
};
