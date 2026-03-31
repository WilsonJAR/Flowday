import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  defaultPersistedState,
  FLOWDAY_STORAGE_KEY,
  FLOWDAY_STORAGE_VERSION,
  FlowDayPersistedState,
} from '../../store/app-state';
import { FocusSession, TabKey, Task } from '../../types';

type LegacyState = {
  activeTab?: TabKey;
  selectedDate?: string;
  tasks?: Task[];
  focusSessions?: FocusSession[];
  isDarkMode?: boolean;
  onboardingCompleted?: boolean;
  profile?: Partial<FlowDayPersistedState['profile']>;
};

function normalizePersistedState(
  rawState: Partial<FlowDayPersistedState & LegacyState>,
): FlowDayPersistedState {
  const normalizedTasks = Array.isArray(rawState.tasks)
    ? rawState.tasks.map(task => ({
        ...task,
        priority: task.priority ?? 'medium',
        subtasks: Array.isArray(task.subtasks)
          ? task.subtasks.map(subtask => ({
              id: subtask.id,
              title: subtask.title ?? '',
              completed: !!subtask.completed,
            }))
          : [],
      }))
    : defaultPersistedState.tasks;

  return {
    version: FLOWDAY_STORAGE_VERSION,
    activeTab: rawState.activeTab ?? defaultPersistedState.activeTab,
    selectedDate: rawState.selectedDate ?? defaultPersistedState.selectedDate,
    tasks: normalizedTasks,
    focusSessions: Array.isArray(rawState.focusSessions)
      ? rawState.focusSessions
      : defaultPersistedState.focusSessions,
    isDarkMode:
      typeof rawState.isDarkMode === 'boolean'
        ? rawState.isDarkMode
        : defaultPersistedState.isDarkMode,
    onboardingCompleted:
      typeof rawState.onboardingCompleted === 'boolean'
        ? rawState.onboardingCompleted
        : defaultPersistedState.onboardingCompleted,
    profile: {
      ...defaultPersistedState.profile,
      ...rawState.profile,
    },
  };
}

export async function loadPersistedState() {
  const storedValue = await AsyncStorage.getItem(FLOWDAY_STORAGE_KEY);
  if (!storedValue) {
    return null;
  }

  const parsed = JSON.parse(storedValue) as Partial<FlowDayPersistedState & LegacyState>;
  return normalizePersistedState(parsed);
}

export async function savePersistedState(state: FlowDayPersistedState) {
  await AsyncStorage.setItem(FLOWDAY_STORAGE_KEY, JSON.stringify(state));
}
