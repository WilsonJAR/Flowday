import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { TODAY_KEY } from '../constants/planner';
import { EditorState, TabKey, Task } from '../types';
import {
  loadPersistedState,
  savePersistedState,
} from '../services/storage/flowday-storage';
import {
  createInitialFlowDayState,
  flowDayReducer,
} from './flowday-reducer';
import { FLOWDAY_STORAGE_VERSION } from './app-state';

type FlowDayContextValue = {
  activeTab: TabKey;
  tasks: Task[];
  editorVisible: boolean;
  editorState: EditorState | null;
  isDarkMode: boolean;
  isHydrated: boolean;
  setActiveTab: (tab: TabKey) => void;
  setIsDarkMode: (value: boolean) => void;
  setEditorState: (state: EditorState | null) => void;
  openCreateModal: (inInbox?: boolean) => void;
  openEditModal: (task: Task) => void;
  closeEditor: () => void;
  saveTask: () => void;
  toggleTaskComplete: (taskId: string) => void;
  moveTaskToInbox: (taskId: string) => void;
  duplicateTask: (taskId: string) => void;
  scheduleInboxTask: (task: Task) => void;
};

const FlowDayContext = createContext<FlowDayContextValue | undefined>(undefined);

export function FlowDayProvider({
  children,
  initialDarkMode,
}: {
  children: React.ReactNode;
  initialDarkMode: boolean;
}) {
  const [state, dispatch] = useReducer(
    flowDayReducer,
    initialDarkMode,
    createInitialFlowDayState,
  );
  const {
    activeTab,
    tasks,
    editorVisible,
    editorState,
    isDarkMode,
    isHydrated,
  } = state;

  useEffect(() => {
    let mounted = true;

    const hydrateState = async () => {
      try {
        const parsed = await loadPersistedState();
        if (!parsed) {
          return;
        }

        if (!mounted) {
          return;
        }

        dispatch({ type: 'hydrate', payload: parsed });
      } catch (error) {
        console.warn('Failed to hydrate FlowDay state', error);
      } finally {
        if (mounted) {
          dispatch({ type: 'set_hydrated' });
        }
      }
    };

    hydrateState();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const persistState = async () => {
      try {
        await savePersistedState({
          version: FLOWDAY_STORAGE_VERSION,
          activeTab,
          tasks,
          isDarkMode,
        });
      } catch (error) {
        console.warn('Failed to persist FlowDay state', error);
      }
    };

    persistState();
  }, [activeTab, isDarkMode, isHydrated, tasks]);

  const openCreateModal = (inInbox = false) => {
    dispatch({
      type: 'open_editor',
      payload: {
      title: '',
      categoryId: 'work',
      energyLevel: 'low',
      startHour: 9,
      startMinute: 0,
      durationMinutes: 60,
      notes: '',
      isAllDay: false,
      inInbox,
      },
    });
  };

  const openEditModal = (task: Task) => {
    dispatch({
      type: 'open_editor',
      payload: {
        id: task.id,
        title: task.title,
        categoryId: task.categoryId,
        energyLevel: task.energyLevel,
        startHour: task.startHour ?? 9,
        startMinute: task.startMinute ?? 0,
        durationMinutes: task.durationMinutes ?? 60,
        notes: task.notes ?? '',
        isAllDay: !!task.isAllDay,
        inInbox: !!task.inInbox,
      },
    });
  };

  const closeEditor = () => {
    dispatch({ type: 'close_editor' });
  };

  const saveTask = () => {
    if (!editorState || !editorState.title.trim()) {
      return;
    }

    const nextTaskRecord: Task = {
      id: editorState.id ?? String(Date.now()),
      title: editorState.title.trim(),
      categoryId: editorState.categoryId,
      energyLevel: editorState.energyLevel,
      startHour: editorState.inInbox || editorState.isAllDay ? undefined : editorState.startHour,
      startMinute:
        editorState.inInbox || editorState.isAllDay ? undefined : editorState.startMinute,
      durationMinutes:
        editorState.inInbox || editorState.isAllDay
          ? undefined
          : editorState.durationMinutes,
      notes: editorState.notes.trim(),
      completed: false,
      date: TODAY_KEY,
      isAllDay: editorState.isAllDay,
      inInbox: editorState.inInbox,
    };

    const existingIndex = tasks.findIndex(task => task.id === nextTaskRecord.id);
    if (existingIndex >= 0) {
      const existingTask = tasks[existingIndex];
      const updatedTask = {
        ...existingTask,
        ...nextTaskRecord,
        completed: existingTask.completed,
      };
      const nextTasks = [...tasks];
      nextTasks[existingIndex] = updatedTask;
      dispatch({ type: 'set_tasks', payload: nextTasks });
    } else {
      dispatch({ type: 'set_tasks', payload: [...tasks, nextTaskRecord] });
    }

    closeEditor();
  };

  const toggleTaskComplete = (taskId: string) => {
    dispatch({
      type: 'set_tasks',
      payload: tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    });
  };

  const moveTaskToInbox = (taskId: string) => {
    dispatch({
      type: 'set_tasks',
      payload: tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              inInbox: true,
              isAllDay: false,
              startHour: undefined,
              startMinute: undefined,
              durationMinutes: undefined,
            }
          : task,
      ),
    });
    dispatch({ type: 'set_active_tab', payload: 'inbox' });
  };

  const duplicateTask = (taskId: string) => {
    const target = tasks.find(task => task.id === taskId);
    if (!target) {
      return;
    }

    dispatch({
      type: 'set_tasks',
      payload: [
        ...tasks,
        {
          ...target,
          id: `${taskId}-${Date.now()}`,
          title: `${target.title} copia`,
          completed: false,
        },
      ],
    });
  };

  const scheduleInboxTask = (task: Task) => {
    dispatch({
      type: 'set_tasks',
      payload: tasks.map(currentTask =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              inInbox: false,
              startHour: 17,
              startMinute: 0,
              durationMinutes: 45,
            }
          : currentTask,
      ),
    });
    dispatch({ type: 'set_active_tab', payload: 'today' });
  };

  const value = {
    activeTab,
    tasks,
    editorVisible,
    editorState,
    isDarkMode,
    isHydrated,
    setActiveTab: (tab: TabKey) => dispatch({ type: 'set_active_tab', payload: tab }),
    setIsDarkMode: (nextValue: boolean) =>
      dispatch({ type: 'set_dark_mode', payload: nextValue }),
    setEditorState: (nextState: EditorState | null) =>
      dispatch({ type: 'set_editor_state', payload: nextState }),
    openCreateModal,
    openEditModal,
    closeEditor,
    saveTask,
    toggleTaskComplete,
    moveTaskToInbox,
    duplicateTask,
    scheduleInboxTask,
  };

  return <FlowDayContext.Provider value={value}>{children}</FlowDayContext.Provider>;
}

export function useFlowDay() {
  const context = useContext(FlowDayContext);
  if (!context) {
    throw new Error('useFlowDay must be used within FlowDayProvider');
  }
  return context;
}
