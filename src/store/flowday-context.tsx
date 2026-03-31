import React, { createContext, useContext, useEffect, useReducer } from 'react';
import {
  EditorState,
  FocusSession,
  PlannerProfile,
  TabKey,
  Task,
} from '../types';
import {
  loadPersistedState,
  savePersistedState,
} from '../services/storage/flowday-storage';
import {
  cancelFocusNotification,
  requestNotificationPermission,
  scheduleFocusNotification,
  syncTaskReminders,
} from '../services/notifications/notifee-service';
import {
  createInitialFlowDayState,
  flowDayReducer,
} from './flowday-reducer';
import { FLOWDAY_STORAGE_VERSION } from './app-state';

type FlowDayContextValue = {
  activeTab: TabKey;
  selectedDate: string;
  tasks: Task[];
  focusSessions: FocusSession[];
  profile: PlannerProfile;
  editorVisible: boolean;
  editorState: EditorState | null;
  isDarkMode: boolean;
  isHydrated: boolean;
  onboardingCompleted: boolean;
  activeFocusTaskId: string | null;
  setActiveTab: (tab: TabKey) => void;
  setSelectedDate: (dateKey: string) => void;
  setIsDarkMode: (value: boolean) => void;
  setEditorState: (state: EditorState | null) => void;
  completeOnboarding: (profile: PlannerProfile) => void;
  reopenOnboarding: () => void;
  startFocusSession: (task: Task) => void;
  completeFocusSession: (taskId: string) => void;
  cancelFocusSession: () => void;
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
    selectedDate,
    tasks,
    focusSessions,
    profile,
    editorVisible,
    editorState,
    isDarkMode,
    isHydrated,
    onboardingCompleted,
  } = state;
  const activeFocusSession = focusSessions.find(session => !session.endedAt) ?? null;
  const activeFocusTaskId = activeFocusSession?.taskId ?? null;

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
    if (!isHydrated || !onboardingCompleted) {
      return;
    }

    const persistState = async () => {
      try {
        await savePersistedState({
          version: FLOWDAY_STORAGE_VERSION,
          activeTab,
          selectedDate,
          tasks,
          focusSessions,
          isDarkMode,
          onboardingCompleted,
          profile,
        });
      } catch (error) {
        console.warn('Failed to persist FlowDay state', error);
      }
    };

    persistState();
  }, [
    activeTab,
    focusSessions,
    isDarkMode,
    isHydrated,
    onboardingCompleted,
    profile,
    selectedDate,
    tasks,
  ]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const syncNotifications = async () => {
      if (profile.notificationsEnabled) {
        await requestNotificationPermission();
      }
      await syncTaskReminders(tasks, profile.notificationsEnabled);
    };

    syncNotifications().catch(error => {
      console.warn('Failed to sync reminders', error);
    });
  }, [isHydrated, onboardingCompleted, profile.notificationsEnabled, tasks]);

  const openCreateModal = (inInbox = false) => {
    dispatch({
      type: 'open_editor',
      payload: {
        title: '',
        categoryId: 'work',
        energyLevel: 'low',
        priority: 'medium',
        startHour: profile.dayStartHour,
        startMinute: 0,
        durationMinutes: profile.defaultDurationMinutes,
        reminderMinutesBefore: profile.notificationsEnabled
          ? profile.defaultReminderMinutes
          : null,
        notes: '',
        subtasks: [],
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
        priority: task.priority,
        startHour: task.startHour ?? 9,
        startMinute: task.startMinute ?? 0,
        durationMinutes: task.durationMinutes ?? 60,
        reminderMinutesBefore: task.reminderMinutesBefore ?? null,
        notes: task.notes ?? '',
        subtasks: task.subtasks,
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
      priority: editorState.priority,
      startHour: editorState.inInbox || editorState.isAllDay ? undefined : editorState.startHour,
      startMinute:
        editorState.inInbox || editorState.isAllDay ? undefined : editorState.startMinute,
      durationMinutes:
        editorState.inInbox || editorState.isAllDay
          ? undefined
          : editorState.durationMinutes,
      reminderMinutesBefore:
        editorState.inInbox || editorState.isAllDay ? null : editorState.reminderMinutesBefore,
      notes: editorState.notes.trim(),
      subtasks: editorState.subtasks
        .map(subtask => ({
          ...subtask,
          title: subtask.title.trim(),
        }))
        .filter(subtask => subtask.title.length > 0),
      completed: false,
      date: selectedDate,
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
          subtasks: target.subtasks.map(subtask => ({
            ...subtask,
            id: `${subtask.id}-${Date.now()}`,
          })),
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

  const startFocusSession = (task: Task) => {
    const nextSession: FocusSession = {
      id: `focus-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      date: selectedDate,
      startedAt: new Date().toISOString(),
      durationMinutes: task.durationMinutes ?? profile.defaultDurationMinutes,
      completed: false,
    };
    const nextSessions = [
      ...focusSessions.filter(session => session.endedAt),
      nextSession,
    ];
    dispatch({ type: 'set_focus_sessions', payload: nextSessions });
    if (profile.notificationsEnabled) {
      scheduleFocusNotification(nextSession).catch(error => {
        console.warn('Failed to schedule focus notification', error);
      });
    }
  };

  const completeFocusSession = (taskId: string) => {
    const nextSessions = focusSessions.map(session =>
      !session.endedAt && session.taskId === taskId
        ? {
            ...session,
            endedAt: new Date().toISOString(),
            completed: true,
          }
        : session,
    );
    dispatch({ type: 'set_focus_sessions', payload: nextSessions });
    cancelFocusNotification().catch(() => {});
    toggleTaskComplete(taskId);
  };

  const cancelFocusSession = () => {
    const nextSessions = focusSessions.map(session =>
      !session.endedAt
        ? {
            ...session,
            endedAt: new Date().toISOString(),
            completed: false,
          }
        : session,
    );
    dispatch({ type: 'set_focus_sessions', payload: nextSessions });
    cancelFocusNotification().catch(() => {});
  };

  const value = {
    activeTab,
    selectedDate,
    tasks,
    focusSessions,
    profile,
    editorVisible,
    editorState,
    isDarkMode,
    isHydrated,
    onboardingCompleted,
    activeFocusTaskId,
    setActiveTab: (tab: TabKey) => dispatch({ type: 'set_active_tab', payload: tab }),
    setSelectedDate: (dateKey: string) =>
      dispatch({ type: 'set_selected_date', payload: dateKey }),
    setIsDarkMode: (nextValue: boolean) =>
      dispatch({ type: 'set_dark_mode', payload: nextValue }),
    setEditorState: (nextState: EditorState | null) =>
      dispatch({ type: 'set_editor_state', payload: nextState }),
    completeOnboarding: (nextProfile: PlannerProfile) =>
      dispatch({ type: 'complete_onboarding', payload: nextProfile }),
    reopenOnboarding: () => dispatch({ type: 'reopen_onboarding' }),
    startFocusSession,
    completeFocusSession,
    cancelFocusSession,
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
