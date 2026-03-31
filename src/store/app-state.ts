import { TabKey, Task } from '../types';

export const FLOWDAY_STORAGE_KEY = '@flowday/app-state';
export const FLOWDAY_STORAGE_VERSION = 1;

export type FlowDayPersistedState = {
  version: number;
  activeTab: TabKey;
  tasks: Task[];
  isDarkMode: boolean;
};

export type FlowDayRuntimeState = FlowDayPersistedState & {
  isHydrated: boolean;
};

export const defaultPersistedState: FlowDayPersistedState = {
  version: FLOWDAY_STORAGE_VERSION,
  activeTab: 'today',
  tasks: [],
  isDarkMode: false,
};
