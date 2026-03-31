import { initialTasks } from '../data/mock-data';
import { EditorState, PlannerProfile, TabKey, Task } from '../types';
import { getTodayDateKey } from '../utils/dates';
import {
  defaultPersistedState,
  FLOWDAY_STORAGE_VERSION,
  FlowDayPersistedState,
  FlowDayRuntimeState,
} from './app-state';

export type FlowDayState = FlowDayRuntimeState & {
  editorVisible: boolean;
  editorState: EditorState | null;
};

type HydratePayload = Partial<FlowDayPersistedState> & {
  isDarkMode?: boolean;
};

export type FlowDayAction =
  | { type: 'hydrate'; payload: HydratePayload }
  | { type: 'set_hydrated' }
  | { type: 'set_active_tab'; payload: TabKey }
  | { type: 'set_selected_date'; payload: string }
  | { type: 'set_dark_mode'; payload: boolean }
  | { type: 'complete_onboarding'; payload: PlannerProfile }
  | { type: 'reopen_onboarding' }
  | { type: 'set_editor_state'; payload: EditorState | null }
  | { type: 'open_editor'; payload: EditorState }
  | { type: 'close_editor' }
  | { type: 'set_tasks'; payload: Task[] };

export function createInitialFlowDayState(initialDarkMode: boolean): FlowDayState {
  return {
    ...defaultPersistedState,
    version: FLOWDAY_STORAGE_VERSION,
    selectedDate: getTodayDateKey(),
    tasks: initialTasks,
    isDarkMode: initialDarkMode,
    onboardingCompleted: false,
    profile: defaultPersistedState.profile,
    isHydrated: false,
    editorVisible: false,
    editorState: null,
  };
}

export function flowDayReducer(state: FlowDayState, action: FlowDayAction): FlowDayState {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        ...action.payload,
        version: FLOWDAY_STORAGE_VERSION,
      };
    case 'set_hydrated':
      return {
        ...state,
        isHydrated: true,
      };
    case 'set_active_tab':
      return {
        ...state,
        activeTab: action.payload,
      };
    case 'set_selected_date':
      return {
        ...state,
        selectedDate: action.payload,
      };
    case 'set_dark_mode':
      return {
        ...state,
        isDarkMode: action.payload,
      };
    case 'complete_onboarding':
      return {
        ...state,
        onboardingCompleted: true,
        profile: action.payload,
      };
    case 'reopen_onboarding':
      return {
        ...state,
        onboardingCompleted: false,
      };
    case 'set_editor_state':
      return {
        ...state,
        editorState: action.payload,
      };
    case 'open_editor':
      return {
        ...state,
        editorVisible: true,
        editorState: action.payload,
      };
    case 'close_editor':
      return {
        ...state,
        editorVisible: false,
        editorState: null,
      };
    case 'set_tasks':
      return {
        ...state,
        tasks: action.payload,
      };
    default:
      return state;
  }
}
