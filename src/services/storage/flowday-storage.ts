import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  defaultPersistedState,
  FLOWDAY_STORAGE_KEY,
  FLOWDAY_STORAGE_VERSION,
  FlowDayPersistedState,
} from '../../store/app-state';
import { TabKey, Task } from '../../types';

type LegacyState = {
  activeTab?: TabKey;
  selectedDate?: string;
  tasks?: Task[];
  isDarkMode?: boolean;
};

function normalizePersistedState(
  rawState: Partial<FlowDayPersistedState & LegacyState>,
): FlowDayPersistedState {
  return {
    version: FLOWDAY_STORAGE_VERSION,
    activeTab: rawState.activeTab ?? defaultPersistedState.activeTab,
    selectedDate: rawState.selectedDate ?? defaultPersistedState.selectedDate,
    tasks: Array.isArray(rawState.tasks) ? rawState.tasks : defaultPersistedState.tasks,
    isDarkMode:
      typeof rawState.isDarkMode === 'boolean'
        ? rawState.isDarkMode
        : defaultPersistedState.isDarkMode,
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
