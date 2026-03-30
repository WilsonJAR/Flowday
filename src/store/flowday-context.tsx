import React, { createContext, useContext, useState } from 'react';
import { EditorState, TabKey, Task } from '../types';
import { initialTasks } from '../data/mock-data';
import { TODAY_KEY } from '../constants/planner';

type FlowDayContextValue = {
  activeTab: TabKey;
  tasks: Task[];
  editorVisible: boolean;
  editorState: EditorState | null;
  isDarkMode: boolean;
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
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);

  const openCreateModal = (inInbox = false) => {
    setEditorState({
      title: '',
      categoryId: 'work',
      energyLevel: 'low',
      startHour: 9,
      startMinute: 0,
      durationMinutes: 60,
      notes: '',
      isAllDay: false,
      inInbox,
    });
    setEditorVisible(true);
  };

  const openEditModal = (task: Task) => {
    setEditorState({
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
    });
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditorState(null);
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

    setTasks(currentTasks => {
      const existingIndex = currentTasks.findIndex(task => task.id === nextTaskRecord.id);
      if (existingIndex >= 0) {
        const existingTask = currentTasks[existingIndex];
        const updatedTask = {
          ...existingTask,
          ...nextTaskRecord,
          completed: existingTask.completed,
        };
        const nextTasks = [...currentTasks];
        nextTasks[existingIndex] = updatedTask;
        return nextTasks;
      }
      return [...currentTasks, nextTaskRecord];
    });

    closeEditor();
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const moveTaskToInbox = (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
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
    );
    setActiveTab('inbox');
  };

  const duplicateTask = (taskId: string) => {
    setTasks(currentTasks => {
      const target = currentTasks.find(task => task.id === taskId);
      if (!target) {
        return currentTasks;
      }

      return [
        ...currentTasks,
        {
          ...target,
          id: `${taskId}-${Date.now()}`,
          title: `${target.title} copia`,
          completed: false,
        },
      ];
    });
  };

  const scheduleInboxTask = (task: Task) => {
    setTasks(currentTasks =>
      currentTasks.map(currentTask =>
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
    );
    setActiveTab('today');
  };

  const value = {
    activeTab,
    tasks,
    editorVisible,
    editorState,
    isDarkMode,
    setActiveTab,
    setIsDarkMode,
    setEditorState,
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
