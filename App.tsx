import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type TabKey = 'today' | 'inbox' | 'week' | 'more';
type CategoryId =
  | 'study'
  | 'work'
  | 'personal'
  | 'health'
  | 'routine'
  | 'reminder';
type EnergyLevel = 'low' | 'medium' | 'high';

type Task = {
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

type Theme = {
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

type CategoryDefinition = {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
  softColor: string;
};

type EditorState = {
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

const TODAY_KEY = '2026-03-30';
const HOUR_HEIGHT = 92;
const TIMELINE_START_HOUR = 6;
const TIMELINE_END_HOUR = 14;

const categories: CategoryDefinition[] = [
  {
    id: 'study',
    label: 'Estudio',
    icon: '◫',
    color: '#6EA8FF',
    softColor: '#EAF2FF',
  },
  {
    id: 'work',
    label: 'Trabajo',
    icon: '▣',
    color: '#6366F1',
    softColor: '#EEECFF',
  },
  {
    id: 'personal',
    label: 'Personal',
    icon: '◌',
    color: '#4EC58D',
    softColor: '#E8FFF3',
  },
  {
    id: 'health',
    label: 'Salud',
    icon: '♡',
    color: '#F3A25F',
    softColor: '#FFF2E8',
  },
  {
    id: 'routine',
    label: 'Rutina',
    icon: '↻',
    color: '#8A8EF5',
    softColor: '#EFF0FF',
  },
  {
    id: 'reminder',
    label: 'Recordatorio',
    icon: '◔',
    color: '#9A9FB3',
    softColor: '#F0F2F8',
  },
];

const durationOptions = [15, 30, 45, 60, 90, 120];
const hourOptions = Array.from({ length: 18 }, (_, index) => index + 6);
const minuteOptions = [0, 15, 30, 45];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Meditación matutina',
    categoryId: 'health',
    energyLevel: 'low',
    startHour: 7,
    startMinute: 0,
    durationMinutes: 15,
    date: TODAY_KEY,
    completed: true,
  },
  {
    id: '2',
    title: 'Revisión de emails y planificación',
    categoryId: 'routine',
    energyLevel: 'medium',
    startHour: 9,
    startMinute: 0,
    durationMinutes: 60,
    date: TODAY_KEY,
    completed: true,
  },
  {
    id: '3',
    title: 'Sesión de trabajo enfocado',
    categoryId: 'work',
    energyLevel: 'high',
    startHour: 10,
    startMinute: 0,
    durationMinutes: 120,
    notes: 'Propuesta del cliente y revisión final',
    date: TODAY_KEY,
    completed: false,
  },
  {
    id: '4',
    title: 'Almuerzo y descanso',
    categoryId: 'personal',
    energyLevel: 'low',
    startHour: 13,
    startMinute: 0,
    durationMinutes: 60,
    date: TODAY_KEY,
    completed: false,
  },
  {
    id: '5',
    title: 'Llamada con equipo',
    categoryId: 'work',
    energyLevel: 'medium',
    startHour: 15,
    startMinute: 30,
    durationMinutes: 30,
    date: TODAY_KEY,
    completed: false,
  },
  {
    id: '6',
    title: 'Gym',
    categoryId: 'health',
    energyLevel: 'high',
    startHour: 18,
    startMinute: 0,
    durationMinutes: 60,
    date: TODAY_KEY,
    completed: false,
  },
  {
    id: '7',
    title: 'Planear mañana',
    categoryId: 'routine',
    energyLevel: 'low',
    startHour: 21,
    startMinute: 0,
    durationMinutes: 30,
    date: TODAY_KEY,
    completed: false,
  },
  {
    id: '8',
    title: 'Comprar ingredientes para la cena',
    categoryId: 'personal',
    energyLevel: 'low',
    date: TODAY_KEY,
    completed: false,
    inInbox: true,
  },
  {
    id: '9',
    title: 'Revisar capítulo 3 del libro',
    categoryId: 'study',
    energyLevel: 'medium',
    date: TODAY_KEY,
    completed: false,
    inInbox: true,
  },
];

const lightTheme: Theme = {
  background: '#F5F7FF',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F4FF',
  text: '#202531',
  textSoft: '#4A5265',
  textMuted: '#8A92A8',
  border: '#E6EAF6',
  accent: '#6366F1',
  accentSoft: '#EEF0FF',
  accentStrong: '#4F56EC',
  shadow: 'rgba(77, 90, 165, 0.08)',
  timelineLine: '#E9EDF7',
  inputFill: '#F2F4FF',
};

const darkTheme: Theme = {
  background: '#0F1320',
  surface: '#171D2D',
  surfaceMuted: '#1D2336',
  text: '#F5F7FF',
  textSoft: '#CDD6EC',
  textMuted: '#8B95AE',
  border: '#2A3248',
  accent: '#7C82FF',
  accentSoft: '#232A46',
  accentStrong: '#8B91FF',
  shadow: 'rgba(0, 0, 0, 0.28)',
  timelineLine: '#283146',
  inputFill: '#20283C',
};

const tabItems: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'today', label: 'Today', icon: '⌂' },
  { key: 'inbox', label: 'Inbox', icon: '▱' },
  { key: 'week', label: 'Week', icon: '☷' },
  { key: 'more', label: 'More', icon: '⚙' },
];

function App() {
  const systemScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');

  const theme = isDarkMode ? darkTheme : lightTheme;

  const todayTasks = useMemo(
    () => tasks.filter(task => task.date === TODAY_KEY && !task.inInbox),
    [tasks],
  );
  const inboxTasks = useMemo(
    () => tasks.filter(task => task.inInbox),
    [tasks],
  );

  const completedToday = todayTasks.filter(task => task.completed).length;
  const completionRate = todayTasks.length
    ? Math.round((completedToday / todayTasks.length) * 100)
    : 0;
  const plannedMinutes = todayTasks.reduce(
    (sum, task) => sum + (task.durationMinutes ?? 0),
    0,
  );
  const loadLabel = getLoadLabel(todayTasks);
  const nextTask =
    todayTasks.find(task => !task.completed && typeof task.startHour === 'number') ??
    null;

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

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.appShell}>
          <View style={styles.contentArea}>
            {activeTab === 'today' ? (
              <TodayScreen
                theme={theme}
                tasks={todayTasks}
                completionRate={completionRate}
                plannedMinutes={plannedMinutes}
                loadLabel={loadLabel}
                nextTask={nextTask}
                onEditTask={openEditModal}
                onToggleComplete={toggleTaskComplete}
                onDuplicateTask={duplicateTask}
                onMoveToInbox={moveTaskToInbox}
              />
            ) : null}
            {activeTab === 'inbox' ? (
              <InboxScreen
                theme={theme}
                tasks={inboxTasks}
                onAddTask={() => openCreateModal(true)}
                onEditTask={openEditModal}
                onScheduleTask={scheduleInboxTask}
              />
            ) : null}
            {activeTab === 'week' ? (
              <WeekScreen theme={theme} tasks={todayTasks} />
            ) : null}
            {activeTab === 'more' ? (
              <MoreScreen
                theme={theme}
                isDarkMode={isDarkMode}
                onToggleTheme={setIsDarkMode}
              />
            ) : null}
          </View>

          <BottomNavigation
            theme={theme}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onOpenEditor={() => openCreateModal(activeTab === 'inbox')}
          />

          <TaskEditorModal
            visible={editorVisible}
            theme={theme}
            editorState={editorState}
            onClose={closeEditor}
            onSave={saveTask}
            onChange={setEditorState}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function TodayScreen({
  theme,
  tasks,
  completionRate,
  plannedMinutes,
  loadLabel,
  nextTask,
  onEditTask,
  onToggleComplete,
  onDuplicateTask,
  onMoveToInbox,
}: {
  theme: Theme;
  tasks: Task[];
  completionRate: number;
  plannedMinutes: number;
  loadLabel: string;
  nextTask: Task | null;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDuplicateTask: (taskId: string) => void;
  onMoveToInbox: (taskId: string) => void;
}) {
  const visibleHours = Array.from(
    { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 },
    (_, index) => TIMELINE_START_HOUR + index,
  );
  const timelineTasks = tasks.filter(
    task =>
      typeof task.startHour === 'number' &&
      typeof task.startMinute === 'number' &&
      typeof task.durationMinutes === 'number',
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Today</Text>
          <Text style={[styles.pageSubtitle, { color: theme.textMuted }]}>
            {formatSpanishDate(TODAY_KEY)}
          </Text>
        </View>
        <View style={styles.headerMetric}>
          <Text style={[styles.headerMetricValue, { color: theme.accent }]}>
            {completionRate}%
          </Text>
          <Text style={[styles.headerMetricLabel, { color: theme.textMuted }]}>
            completado
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
        ]}>
        <SummaryMetric
          theme={theme}
          icon="☑"
          label="Tareas"
          value={`${tasks.filter(task => task.completed).length}/${tasks.length}`}
        />
        <SummaryMetric
          theme={theme}
          icon="◔"
          label="Planificado"
          value={formatMinutes(plannedMinutes)}
        />
        <SummaryMetric
          theme={theme}
          icon="⌁"
          label="Carga"
          value={loadLabel}
          pill
        />
        <SummaryMetric
          theme={theme}
          icon="⚡"
          label="Próxima"
          value={nextTask ? nextTask.title : 'Todo listo'}
          helper={nextTask ? formatTaskTime(nextTask) : 'Sin pendientes'}
          alignRight
        />
      </View>

      <View
        style={[
          styles.timelineCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
        ]}>
        <View style={styles.timeline}>
          <View style={styles.timelineHoursColumn}>
            {visibleHours.map(hour => (
              <View key={hour} style={[styles.hourSlot, { height: HOUR_HEIGHT }]}>
                <Text style={[styles.hourLabel, { color: theme.textMuted }]}>
                  {String(hour).padStart(2, '0')}:00
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.timelineEventsColumn,
              { borderLeftColor: theme.timelineLine },
            ]}>
            {visibleHours.map(hour => (
              <View
                key={`line-${hour}`}
                style={[
                  styles.timelineGridRow,
                  {
                    borderTopColor: theme.timelineLine,
                    height: HOUR_HEIGHT,
                  },
                ]}
              />
            ))}

            {timelineTasks.map(task => {
              const category = getCategory(task.categoryId);
              const taskTop =
                ((task.startHour! - TIMELINE_START_HOUR) * 60 + task.startMinute!) *
                (HOUR_HEIGHT / 60);
              const taskHeight = Math.max(
                task.durationMinutes! * (HOUR_HEIGHT / 60),
                62,
              );
              const taskCheckFillStyle = task.completed
                ? { backgroundColor: category.color }
                : styles.transparentBackground;
              const taskTitleStateStyle = task.completed
                ? styles.completedTaskTitle
                : styles.activeTaskTitle;

              return (
                <Pressable
                  key={task.id}
                  onPress={() => onEditTask(task)}
                  style={[
                    styles.taskCard,
                    {
                      top: taskTop,
                      height: taskHeight,
                      backgroundColor: category.softColor,
                      borderColor: category.color,
                    },
                  ]}>
                  <View style={styles.taskCardHeader}>
                    <Pressable
                      onPress={() => onToggleComplete(task.id)}
                      style={[
                        styles.taskCheck,
                        {
                          borderColor: task.completed ? category.color : theme.textMuted,
                        },
                        taskCheckFillStyle,
                      ]}
                    />
                    <Text
                      style={[
                        styles.taskTitle,
                        { color: theme.text },
                        taskTitleStateStyle,
                      ]}>
                      {task.title}
                    </Text>
                  </View>

                  <View style={styles.taskMetaRow}>
                    <Text style={[styles.taskMetaText, { color: theme.textMuted }]}>
                      {formatTaskTime(task)}
                    </Text>
                    <Text style={[styles.taskMetaText, { color: theme.textMuted }]}>
                      {energyLabel(task.energyLevel)}
                    </Text>
                    <View
                      style={[
                        styles.categoryPill,
                        styles.transparentBorder,
                        { backgroundColor: theme.background },
                      ]}>
                      <Text style={[styles.categoryPillText, { color: category.color }]}>
                        {category.label}
                      </Text>
                    </View>
                  </View>

                  {!task.completed && taskHeight > 90 && task.notes ? (
                    <Text numberOfLines={2} style={[styles.taskNotes, { color: theme.textSoft }]}>
                      {task.notes}
                    </Text>
                  ) : null}

                  <View style={styles.taskActionsRow}>
                    <MiniAction
                      label="Duplicar"
                      color={theme.textMuted}
                      onPress={() => onDuplicateTask(task.id)}
                    />
                    <MiniAction
                      label="Inbox"
                      color={theme.accent}
                      onPress={() => onMoveToInbox(task.id)}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function InboxScreen({
  theme,
  tasks,
  onAddTask,
  onEditTask,
  onScheduleTask,
}: {
  theme: Theme;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onScheduleTask: (task: Task) => void;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeadingBlock}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Inbox</Text>
        <Text style={[styles.pageSubtitle, { color: theme.textMuted }]}>
          Tareas sin programar
        </Text>
      </View>

      {tasks.map(task => {
        const category = getCategory(task.categoryId);

        return (
          <Pressable
            key={task.id}
            onPress={() => onEditTask(task)}
            style={[
              styles.inboxCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}>
            <Text style={[styles.inboxTitle, { color: theme.text }]}>{task.title}</Text>
            <View style={styles.inboxFooter}>
              <View style={[styles.categoryPill, { backgroundColor: category.softColor }]}>
                <Text style={[styles.categoryPillText, { color: category.color }]}>
                  {category.label}
                </Text>
              </View>
              <Pressable
                style={[styles.secondaryButton, { borderColor: theme.border }]}
                onPress={() => onScheduleTask(task)}>
                <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
                  Programar
                </Text>
              </Pressable>
            </View>
          </Pressable>
        );
      })}

      <Pressable
        onPress={onAddTask}
        style={[
          styles.emptyActionCard,
          {
            backgroundColor: theme.surfaceMuted,
            borderColor: theme.border,
          },
        ]}>
        <Text style={[styles.emptyActionTitle, { color: theme.text }]}>
          Capturar tarea rápida
        </Text>
        <Text style={[styles.emptyActionSubtitle, { color: theme.textMuted }]}>
          Añade ideas aquí y asígnalas a tu timeline después
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function WeekScreen({ theme, tasks }: { theme: Theme; tasks: Task[] }) {
  const weekDays = [
    { label: 'Lun', date: '25', highlight: false, bars: [] as string[], meta: '-' },
    { label: 'Mar', date: '26', highlight: true, bars: ['#F3A25F', '#8A8EF5', '#8A8EF5'], meta: '7 tareas · 6h' },
    { label: 'Mié', date: '27', highlight: false, bars: [] as string[], meta: '-' },
    { label: 'Jue', date: '28', highlight: false, bars: [] as string[], meta: '-' },
    { label: 'Vie', date: '29', highlight: false, bars: [] as string[], meta: '-' },
    { label: 'Sáb', date: '30', highlight: false, bars: [], meta: '-' },
    { label: 'Dom', date: '31', highlight: false, bars: [], meta: '-' },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeadingBlock}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Week</Text>
        <Text style={[styles.pageSubtitle, { color: theme.textMuted }]}>Vista semanal</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.weekRow}>
          {weekDays.map(day => (
            <View
              key={day.label}
              style={[
                styles.weekDayCard,
                {
                  backgroundColor: day.highlight ? theme.surface : theme.surface,
                  borderColor: day.highlight ? theme.accentSoft : theme.border,
                  shadowColor: theme.shadow,
                },
              ]}>
              <Text style={[styles.weekDayLabel, { color: theme.textMuted }]}>{day.label}</Text>
              <Text style={[styles.weekDayDate, { color: theme.text }]}>{day.date}</Text>
              <View style={styles.weekBarsBlock}>
                {day.bars.length ? (
                  day.bars.map((barColor, index) => (
                    <View
                      key={`${day.label}-${index}`}
                      style={[styles.weekBar, { backgroundColor: barColor }]}
                    />
                  ))
                ) : (
                  <Text style={[styles.weekEmptyMark, { color: theme.border }]}>—</Text>
                )}
              </View>
              <Text style={[styles.weekMeta, { color: theme.textMuted }]}>{day.meta}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.weekSummaryCard,
          { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
        ]}>
        <Text style={[styles.weekSummaryTitle, { color: theme.textSoft }]}>
          Vista completa de la semana en desarrollo
        </Text>
        <Text style={[styles.weekSummaryBody, { color: theme.textMuted }]}>
          Hoy tienes {tasks.length} bloques activos. El objetivo de esta vista es detectar carga,
          balance y huecos para replanificar.
        </Text>
      </View>
    </ScrollView>
  );
}

function MoreScreen({
  theme,
  isDarkMode,
  onToggleTheme,
}: {
  theme: Theme;
  isDarkMode: boolean;
  onToggleTheme: (value: boolean) => void;
}) {
  const items = [
    {
      icon: '☼',
      title: 'Tema',
      subtitle: isDarkMode ? 'Modo oscuro' : 'Modo claro',
      trailing: (
        <Switch
          value={isDarkMode}
          onValueChange={onToggleTheme}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor="#FFFFFF"
        />
      ),
    },
    {
      icon: '▤',
      title: 'Estadísticas',
      subtitle: 'Ver tu productividad',
    },
    {
      icon: '◔',
      title: 'Notificaciones',
      subtitle: 'Configurar recordatorios',
    },
    {
      icon: '☷',
      title: 'Integración calendario',
      subtitle: 'Conectar calendarios externos',
      muted: true,
    },
    {
      icon: '♕',
      title: 'FlowDay Pro',
      subtitle: 'Desbloquear funciones premium',
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeadingBlock}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>More</Text>
        <Text style={[styles.pageSubtitle, { color: theme.textMuted }]}>
          Configuración y más
        </Text>
      </View>

      {items.map(item => (
        <View
          key={item.title}
          style={[
            styles.settingsCard,
            {
              backgroundColor: item.muted ? theme.surfaceMuted : theme.surface,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}>
          <Text style={[styles.settingsIcon, { color: theme.accent }]}>{item.icon}</Text>
          <View style={styles.settingsTextBlock}>
            <Text style={[styles.settingsTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.settingsSubtitle, { color: theme.textMuted }]}>
              {item.subtitle}
            </Text>
          </View>
          {item.trailing ?? null}
        </View>
      ))}

      <View style={styles.versionRow}>
        <Text style={[styles.versionText, { color: theme.textMuted }]}>ⓘ FlowDay v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function BottomNavigation({
  theme,
  activeTab,
  onChangeTab,
  onOpenEditor,
}: {
  theme: Theme;
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  onOpenEditor: () => void;
}) {
  return (
    <View
      style={[
        styles.bottomBar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}>
      <View style={styles.bottomTabsRow}>
        {tabItems.slice(0, 2).map(item => (
          <TabButton
            key={item.key}
            theme={theme}
            item={item}
            active={activeTab === item.key}
            onPress={() => onChangeTab(item.key)}
          />
        ))}

        <View style={styles.fabSpacer} />

        {tabItems.slice(2).map(item => (
          <TabButton
            key={item.key}
            theme={theme}
            item={item}
            active={activeTab === item.key}
            onPress={() => onChangeTab(item.key)}
          />
        ))}
      </View>

      <Pressable
        style={[
          styles.fabButton,
          {
            backgroundColor: theme.accent,
            shadowColor: theme.shadow,
          },
        ]}
        onPress={onOpenEditor}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

function TabButton({
  theme,
  item,
  active,
  onPress,
}: {
  theme: Theme;
  item: { key: TabKey; label: string; icon: string };
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <Text style={[styles.tabIcon, { color: active ? theme.accent : theme.textMuted }]}>
        {item.icon}
      </Text>
      <Text style={[styles.tabLabel, { color: active ? theme.accent : theme.textMuted }]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

function TaskEditorModal({
  visible,
  theme,
  editorState,
  onClose,
  onSave,
  onChange,
}: {
  visible: boolean;
  theme: Theme;
  editorState: EditorState | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (state: EditorState | null) => void;
}) {
  if (!editorState) {
    return null;
  }

  const title = editorState.id ? 'Editar tarea' : 'Nueva tarea';
  const cta = editorState.id ? 'Guardar' : 'Crear';
  const allDayCheckStyle = editorState.isAllDay
    ? { backgroundColor: theme.text }
    : styles.transparentBackground;
  const inboxCheckStyle = editorState.inInbox
    ? { backgroundColor: theme.text }
    : styles.transparentBackground;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
            <Pressable onPress={onClose}>
              <Text style={[styles.modalClose, { color: theme.textSoft }]}>×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              placeholder="¿Qué vas a hacer?"
              placeholderTextColor={theme.textMuted}
              value={editorState.title}
              onChangeText={value => onChange({ ...editorState, title: value })}
              style={[
                styles.titleInput,
                {
                  color: theme.text,
                  borderBottomColor: theme.border,
                },
              ]}
            />

            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Categoría</Text>
            <View style={styles.categoryGrid}>
              {categories.map(category => {
                const selected = editorState.categoryId === category.id;
                const categoryChipTextStyle = selected
                  ? styles.selectedChipText
                  : { color: theme.textSoft };
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => onChange({ ...editorState, categoryId: category.id })}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: selected ? theme.accent : theme.surfaceMuted,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.categoryChipText,
                        categoryChipTextStyle,
                      ]}>
                      {category.icon} {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() =>
                onChange({
                  ...editorState,
                  isAllDay: !editorState.isAllDay,
                  inInbox: editorState.isAllDay ? editorState.inInbox : false,
                })
              }
              style={styles.checkboxRow}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: theme.textSoft,
                  },
                  allDayCheckStyle,
                ]}
              />
              <Text style={[styles.checkboxLabel, { color: theme.text }]}>Todo el día</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                onChange({
                  ...editorState,
                  inInbox: !editorState.inInbox,
                  isAllDay: !editorState.inInbox ? false : editorState.isAllDay,
                })
              }
              style={styles.checkboxRow}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: theme.textSoft,
                  },
                  inboxCheckStyle,
                ]}
              />
              <Text style={[styles.checkboxLabel, { color: theme.text }]}>
                Enviar a inbox
              </Text>
            </Pressable>

            {!editorState.isAllDay && !editorState.inInbox ? (
              <View style={styles.timeRow}>
                <FieldColumn label="Hora de inicio" theme={theme}>
                  <View style={styles.pickerRow}>
                    <MiniSelect
                      value={String(editorState.startHour).padStart(2, '0')}
                      options={hourOptions.map(hour => ({
                        label: String(hour).padStart(2, '0'),
                        value: hour,
                      }))}
                      theme={theme}
                      onChange={value =>
                        onChange({ ...editorState, startHour: Number(value) })
                      }
                    />
                    <Text style={[styles.timeSeparator, { color: theme.textSoft }]}>:</Text>
                    <MiniSelect
                      value={String(editorState.startMinute).padStart(2, '0')}
                      options={minuteOptions.map(minute => ({
                        label: String(minute).padStart(2, '0'),
                        value: minute,
                      }))}
                      theme={theme}
                      onChange={value =>
                        onChange({ ...editorState, startMinute: Number(value) })
                      }
                    />
                  </View>
                </FieldColumn>

                <FieldColumn label="Duración" theme={theme}>
                  <MiniSelect
                    value={durationLabel(editorState.durationMinutes)}
                    options={durationOptions.map(option => ({
                      label: durationLabel(option),
                      value: option,
                    }))}
                    theme={theme}
                    onChange={value =>
                      onChange({ ...editorState, durationMinutes: Number(value) })
                    }
                    wide
                  />
                </FieldColumn>
              </View>
            ) : null}

            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
              ⚡ Nivel de energía
            </Text>
            <View style={styles.energyRow}>
              {(['low', 'medium', 'high'] as EnergyLevel[]).map(level => {
                const selected = editorState.energyLevel === level;
                const energyChipTextStyle = selected
                  ? styles.selectedChipText
                  : { color: theme.text };
                return (
                  <Pressable
                    key={level}
                    onPress={() => onChange({ ...editorState, energyLevel: level })}
                    style={[
                      styles.energyChip,
                      {
                        backgroundColor: selected ? theme.accent : theme.surfaceMuted,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.energyChipText,
                        energyChipTextStyle,
                      ]}>
                      {energyLabel(level)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Notas (opcional)</Text>
            <TextInput
              placeholder="Agregar notas..."
              placeholderTextColor={theme.textMuted}
              value={editorState.notes}
              onChangeText={value => onChange({ ...editorState, notes: value })}
              multiline
              style={[
                styles.notesInput,
                {
                  backgroundColor: theme.inputFill,
                  color: theme.text,
                },
              ]}
            />
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
            <Pressable onPress={onClose} style={styles.modalFooterButton}>
              <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              style={[styles.modalPrimaryButton, { backgroundColor: theme.accent }]}>
              <Text style={styles.modalPrimaryText}>{cta}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SummaryMetric({
  theme,
  icon,
  label,
  value,
  helper,
  pill,
  alignRight,
}: {
  theme: Theme;
  icon: string;
  label: string;
  value: string;
  helper?: string;
  pill?: boolean;
  alignRight?: boolean;
}) {
  return (
    <View style={[styles.summaryMetric, alignRight ? styles.summaryMetricRight : null]}>
      <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>
        {icon} {label}
      </Text>
      <View
        style={[
          pill ? styles.loadPill : null,
          pill ? { backgroundColor: theme.accentSoft } : null,
        ]}>
        <Text style={[styles.summaryValue, { color: pill ? theme.accent : theme.text }]}>
          {value}
        </Text>
      </View>
      {helper ? (
        <Text style={[styles.summaryHelper, { color: theme.textMuted }]}>{helper}</Text>
      ) : null}
    </View>
  );
}

function FieldColumn({
  label,
  theme,
  children,
}: {
  label: string;
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldColumn}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

function MiniSelect({
  value,
  options,
  theme,
  onChange,
  wide,
}: {
  value: string;
  options: Array<{ label: string; value: number }>;
  theme: Theme;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  const currentIndex = options.findIndex(option => option.label === value);

  return (
    <Pressable
      onPress={() => {
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % options.length : 0;
        onChange(String(options[nextIndex].value));
      }}
      style={[
        styles.selectButton,
        {
          backgroundColor: theme.inputFill,
        },
        wide ? styles.selectButtonWide : null,
      ]}>
      <Text style={[styles.selectButtonText, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.selectButtonArrow, { color: theme.textMuted }]}>⌄</Text>
    </Pressable>
  );
}

function MiniAction({
  label,
  color,
  onPress,
}: {
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={[styles.miniActionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

function getCategory(categoryId: CategoryId) {
  return categories.find(category => category.id === categoryId) ?? categories[0];
}

function formatSpanishDate(dateKey: string) {
  const formatter = new Intl.DateTimeFormat('es-DO', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const date = new Date(`${dateKey}T12:00:00`);
  const formatted = formatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) {
    return `${minutes}m`;
  }
  if (!minutes) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

function durationLabel(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  if (minutes % 60 === 0) {
    return `${minutes / 60} hora${minutes === 60 ? '' : 's'}`;
  }
  return formatMinutes(minutes);
}

function energyLabel(level: EnergyLevel) {
  if (level === 'low') {
    return 'Baja';
  }
  if (level === 'medium') {
    return 'Media';
  }
  return 'Alta';
}

function getLoadLabel(tasks: Task[]) {
  const score = tasks.reduce((sum, task) => {
    if (task.energyLevel === 'low') {
      return sum + 1;
    }
    if (task.energyLevel === 'medium') {
      return sum + 2;
    }
    return sum + 3;
  }, 0);

  const average = tasks.length ? score / tasks.length : 0;
  if (average < 1.6) {
    return 'Baja';
  }
  if (average < 2.4) {
    return 'Media';
  }
  return 'Alta';
}

function formatTaskTime(task: Task) {
  if (task.isAllDay) {
    return 'Todo el día';
  }
  if (
    typeof task.startHour !== 'number' ||
    typeof task.startMinute !== 'number' ||
    typeof task.durationMinutes !== 'number'
  ) {
    return 'Sin hora';
  }

  const startTotal = task.startHour * 60 + task.startMinute;
  const endTotal = startTotal + task.durationMinutes;
  const endHour = Math.floor(endTotal / 60);
  const endMinute = endTotal % 60;

  return `${String(task.startHour).padStart(2, '0')}:${String(task.startMinute).padStart(
    2,
    '0',
  )} - ${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appShell: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 140,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  pageHeadingBlock: {
    marginBottom: 22,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  headerMetric: {
    alignItems: 'flex-end',
  },
  headerMetricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerMetricLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 4,
    marginBottom: 24,
  },
  summaryMetric: {
    flex: 1,
    gap: 8,
  },
  summaryMetricRight: {
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryHelper: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  timelineCard: {
    borderRadius: 28,
    borderWidth: 1,
    paddingVertical: 22,
    paddingRight: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  timeline: {
    flexDirection: 'row',
  },
  timelineHoursColumn: {
    width: 84,
    paddingTop: 8,
    alignItems: 'center',
  },
  hourSlot: {
    justifyContent: 'flex-start',
  },
  hourLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineEventsColumn: {
    flex: 1,
    position: 'relative',
    minHeight: (TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1) * HOUR_HEIGHT,
    borderLeftWidth: 1,
    paddingLeft: 18,
  },
  timelineGridRow: {
    borderTopWidth: 1,
  },
  taskCard: {
    position: 'absolute',
    left: 18,
    right: 0,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  taskTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  activeTaskTitle: {
    opacity: 1,
    textDecorationLine: 'none',
  },
  completedTaskTitle: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  taskMetaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskNotes: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  taskActionsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
  },
  miniActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inboxCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 3,
  },
  inboxTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  inboxFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyActionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginTop: 12,
  },
  emptyActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyActionSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  weekRow: {
    flexDirection: 'row',
    gap: 12,
  },
  weekDayCard: {
    width: 104,
    minHeight: 178,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
  },
  weekDayLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  weekDayDate: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  weekBarsBlock: {
    minHeight: 50,
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  weekBar: {
    height: 7,
    borderRadius: 999,
  },
  weekEmptyMark: {
    textAlign: 'center',
    fontSize: 22,
  },
  weekMeta: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  weekSummaryCard: {
    marginTop: 22,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  weekSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  weekSummaryBody: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },
  settingsCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
  },
  settingsIcon: {
    width: 28,
    fontSize: 20,
    textAlign: 'center',
    marginRight: 14,
  },
  settingsTextBlock: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  settingsSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  versionRow: {
    paddingVertical: 22,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 18,
  },
  bottomTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  tabButton: {
    width: 74,
    alignItems: 'center',
    gap: 6,
  },
  tabIcon: {
    fontSize: 21,
    fontWeight: '600',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  fabSpacer: {
    width: 88,
  },
  fabButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: -28,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 6,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '300',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(19, 24, 38, 0.42)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    borderRadius: 28,
    borderWidth: 1,
    paddingTop: 18,
    maxHeight: '88%',
  },
  modalHeader: {
    paddingHorizontal: 22,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 28,
    lineHeight: 28,
  },
  titleInput: {
    marginHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: 1,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  categoryChip: {
    minWidth: '30%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 4,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  fieldColumn: {
    flex: 1,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '700',
  },
  selectButton: {
    borderRadius: 18,
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 80,
  },
  selectButtonWide: {
    width: '100%',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  selectButtonArrow: {
    fontSize: 16,
    fontWeight: '700',
  },
  energyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  energyChip: {
    flex: 1,
    minHeight: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyChipText: {
    fontSize: 15,
    fontWeight: '700',
  },
  notesInput: {
    minHeight: 104,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 15,
    fontWeight: '500',
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  modalFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: 'row',
    gap: 12,
  },
  modalFooterButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalPrimaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  transparentBackground: {
    backgroundColor: 'transparent',
  },
  transparentBorder: {
    borderColor: 'transparent',
  },
});

export default App;
