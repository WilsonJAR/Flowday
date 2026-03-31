import { FocusSession, PlannerProfile, TabKey, Task } from '../types';

export const FLOWDAY_STORAGE_KEY = '@flowday/app-state';
export const FLOWDAY_STORAGE_VERSION = 2;

export type FlowDayPersistedState = {
  version: number;
  activeTab: TabKey;
  selectedDate: string;
  tasks: Task[];
  focusSessions: FocusSession[];
  isDarkMode: boolean;
  onboardingCompleted: boolean;
  profile: PlannerProfile;
};

export type FlowDayRuntimeState = FlowDayPersistedState & {
  isHydrated: boolean;
};

export const defaultPersistedState: FlowDayPersistedState = {
  version: FLOWDAY_STORAGE_VERSION,
  activeTab: 'today',
  selectedDate: new Date().toISOString().slice(0, 10),
  tasks: [],
  focusSessions: [],
  isDarkMode: false,
  onboardingCompleted: false,
  profile: {
    userType: 'professional',
    dayStartHour: 7,
    dayEndHour: 22,
    defaultDurationMinutes: 60,
    defaultReminderMinutes: 10,
    notificationsEnabled: true,
    weekStartsOn: 'monday',
  },
};
