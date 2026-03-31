import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  HOUR_HEIGHT,
  TIMELINE_END_HOUR,
  TIMELINE_START_HOUR,
} from '../constants/planner';
import { Theme, Task } from '../types';
import {
  formatDayNumber,
  formatSpanishDate,
  formatWeekdayShort,
  shiftDateKey,
} from '../utils/dates';
import {
  energyLabel,
  formatMinutes,
  formatTaskTime,
  getCategory,
  getPriorityColor,
  priorityLabel,
} from '../utils/planner';

const DRAG_STEP_MINUTES = 15;

type SlotSuggestion = {
  label: string;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
};

export function TodayScreen({
  theme,
  selectedDate,
  tasks,
  completionRate,
  plannedMinutes,
  loadLabel,
  nextTask,
  onEditTask,
  onToggleComplete,
  onDuplicateTask,
  onMoveToInbox,
  onMoveToTomorrow,
  onSelectDate,
  onRescheduleTask,
  onStartFocus,
}: {
  theme: Theme;
  selectedDate: string;
  tasks: Task[];
  completionRate: number;
  plannedMinutes: number;
  loadLabel: string;
  nextTask: Task | null;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDuplicateTask: (taskId: string) => void;
  onMoveToInbox: (taskId: string) => void;
  onMoveToTomorrow: (taskId: string) => void;
  onSelectDate: (dateKey: string) => void;
  onRescheduleTask: (
    taskId: string,
    updates: {
      date?: string;
      startHour?: number;
      startMinute?: number;
      durationMinutes?: number;
      inInbox?: boolean;
    },
  ) => void;
  onStartFocus: (task: Task) => void;
}) {
  const [replanTask, setReplanTask] = useState<Task | null>(null);
  const visibleHours = Array.from(
    { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 },
    (_, index) => TIMELINE_START_HOUR + index,
  );
  const timelineTasks = useMemo(
    () =>
      tasks
        .filter(
          task =>
            typeof task.startHour === 'number' &&
            typeof task.startMinute === 'number' &&
            typeof task.durationMinutes === 'number',
        )
        .sort(
          (left, right) =>
            left.startHour! * 60 +
            left.startMinute! -
            (right.startHour! * 60 + right.startMinute!),
        ),
    [tasks],
  );
  const replanSuggestions = useMemo(
    () => (replanTask ? getSuggestedSlots(timelineTasks, replanTask) : []),
    [replanTask, timelineTasks],
  );

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.pageTitle, { color: theme.text }]}>Today</Text>
            <Text style={[styles.pageSubtitle, { color: theme.textMuted }]}>
              {formatSpanishDate(selectedDate)}
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

        <View style={styles.datePager}>
          <MiniDateButton
            theme={theme}
            label="‹"
            helper={formatDayNumber(shiftDateKey(selectedDate, -1))}
            onPress={() => onSelectDate(shiftDateKey(selectedDate, -1))}
          />
          <View
            style={[
              styles.dateFocusCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.dateFocusWeekday, { color: theme.textMuted }]}>
              {formatWeekdayShort(selectedDate)}
            </Text>
            <Text style={[styles.dateFocusValue, { color: theme.text }]}>
              {formatDayNumber(selectedDate)}
            </Text>
          </View>
          <MiniDateButton
            theme={theme}
            label="›"
            helper={formatDayNumber(shiftDateKey(selectedDate, 1))}
            onPress={() => onSelectDate(shiftDateKey(selectedDate, 1))}
          />
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
          <SummaryMetric theme={theme} icon="⌁" label="Carga" value={loadLabel} pill />
          <SummaryMetric
            theme={theme}
            icon="⚡"
            label="Próxima"
            value={nextTask ? nextTask.title : 'Todo listo'}
            helper={nextTask ? formatTaskTime(nextTask) : 'Sin pendientes'}
          />
        </View>

        <View
          style={[
            styles.replanHintCard,
            {
              backgroundColor: theme.accentSoft,
              borderColor: theme.border,
            },
          ]}>
          <Text style={[styles.replanHintTitle, { color: theme.accent }]}>
            Replanificación visual activa
          </Text>
          <Text style={[styles.replanHintText, { color: theme.textSoft }]}>
            Arrastra una tarea desde el handle para cambiar la hora. Usa Replan para
            moverla a un hueco sugerido, mañana o inbox.
          </Text>
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

              {timelineTasks.map(task => (
                <DraggableTaskCard
                  key={task.id}
                  theme={theme}
                  task={task}
                  onEditTask={onEditTask}
                  onToggleComplete={onToggleComplete}
                  onDuplicateTask={onDuplicateTask}
                  onOpenReplan={setReplanTask}
                  onRescheduleTask={onRescheduleTask}
                  onStartFocus={onStartFocus}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <ReplanTaskModal
        visible={!!replanTask}
        theme={theme}
        task={replanTask}
        suggestions={replanSuggestions}
        onClose={() => setReplanTask(null)}
        onReschedule={(taskId, suggestion) => {
          onRescheduleTask(taskId, {
            startHour: suggestion.startHour,
            startMinute: suggestion.startMinute,
            durationMinutes: suggestion.durationMinutes,
            inInbox: false,
          });
          setReplanTask(null);
        }}
        onMoveToTomorrow={taskId => {
          onMoveToTomorrow(taskId);
          setReplanTask(null);
        }}
        onMoveToInbox={taskId => {
          onMoveToInbox(taskId);
          setReplanTask(null);
        }}
        onEditTask={task => {
          setReplanTask(null);
          onEditTask(task);
        }}
      />
    </>
  );
}

function DraggableTaskCard({
  theme,
  task,
  onEditTask,
  onToggleComplete,
  onDuplicateTask,
  onOpenReplan,
  onRescheduleTask,
  onStartFocus,
}: {
  theme: Theme;
  task: Task;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDuplicateTask: (taskId: string) => void;
  onOpenReplan: (task: Task) => void;
  onRescheduleTask: (
    taskId: string,
    updates: {
      date?: string;
      startHour?: number;
      startMinute?: number;
      durationMinutes?: number;
      inInbox?: boolean;
    },
  ) => void;
  onStartFocus: (task: Task) => void;
}) {
  const category = getCategory(task.categoryId);
  const taskTop =
    ((task.startHour! - TIMELINE_START_HOUR) * 60 + task.startMinute!) * (HOUR_HEIGHT / 60);
  const taskHeight = Math.max(task.durationMinutes! * (HOUR_HEIGHT / 60), 62);
  const dragY = useRef(new Animated.Value(0)).current;
  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  const hasSubtasks = task.subtasks.length > 0;
  const taskCheckFillStyle = task.completed
    ? { backgroundColor: category.color }
    : styles.transparentBackground;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 6 && Math.abs(gestureState.dx) < 20,
        onPanResponderMove: (_, gestureState) => {
          dragY.setValue(gestureState.dy);
        },
        onPanResponderRelease: (_, gestureState) => {
          const totalMinutes = task.startHour! * 60 + task.startMinute!;
          const deltaMinutes = snapMinutes((gestureState.dy / HOUR_HEIGHT) * 60);
          dragY.setValue(0);

          if (Math.abs(deltaMinutes) < DRAG_STEP_MINUTES) {
            return;
          }

          const clampedStartMinutes = clampTaskStartMinutes(
            totalMinutes + deltaMinutes,
            task.durationMinutes!,
          );

          onRescheduleTask(task.id, {
            startHour: Math.floor(clampedStartMinutes / 60),
            startMinute: clampedStartMinutes % 60,
            inInbox: false,
          });
        },
        onPanResponderTerminate: () => {
          dragY.setValue(0);
        },
      }),
    [dragY, onRescheduleTask, task.durationMinutes, task.id, task.startHour, task.startMinute],
  );

  return (
    <Animated.View
      style={[
        styles.taskCard,
        {
          top: taskTop,
          height: taskHeight,
          backgroundColor: category.softColor,
          borderColor: category.color,
          transform: [{ translateY: dragY }],
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
        <Pressable style={styles.taskHeaderTextWrap} onPress={() => onEditTask(task)}>
          <Text
            style={[
              styles.taskTitle,
              { color: theme.text },
              task.completed ? styles.completedTaskTitle : styles.activeTaskTitle,
            ]}>
            {task.title}
          </Text>
        </Pressable>
        <View
          {...panResponder.panHandlers}
          style={[styles.dragHandle, { backgroundColor: theme.background }]}>
          <Text style={[styles.dragHandleText, { color: theme.textMuted }]}>⋮⋮</Text>
        </View>
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
            styles.priorityPill,
            { backgroundColor: getPriorityColor(task.priority) },
          ]}>
          <Text style={styles.priorityPillText}>{priorityLabel(task.priority)}</Text>
        </View>
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

      {hasSubtasks ? (
        <View style={styles.subtaskProgressRow}>
          <Text style={[styles.subtaskProgressText, { color: theme.textSoft }]}>
            {completedSubtasks}/{task.subtasks.length} subtareas
          </Text>
        </View>
      ) : null}

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
          label="Replan"
          color={theme.accent}
          onPress={() => onOpenReplan(task)}
        />
        {!task.completed ? (
          <MiniAction
            label="Focus"
            color={category.color}
            onPress={() => onStartFocus(task)}
          />
        ) : null}
      </View>
    </Animated.View>
  );
}

function ReplanTaskModal({
  visible,
  theme,
  task,
  suggestions,
  onClose,
  onReschedule,
  onMoveToTomorrow,
  onMoveToInbox,
  onEditTask,
}: {
  visible: boolean;
  theme: Theme;
  task: Task | null;
  suggestions: SlotSuggestion[];
  onClose: () => void;
  onReschedule: (taskId: string, suggestion: SlotSuggestion) => void;
  onMoveToTomorrow: (taskId: string) => void;
  onMoveToInbox: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}) {
  if (!task) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.replanModalCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <View style={styles.replanModalHeader}>
            <View style={styles.replanModalTitleBlock}>
              <Text style={[styles.replanModalTitle, { color: theme.text }]}>
                Replanificar tarea
              </Text>
              <Text style={[styles.replanModalSubtitle, { color: theme.textMuted }]}>
                {task.title}
              </Text>
            </View>
            <Pressable onPress={onClose}>
              <Text style={[styles.replanModalClose, { color: theme.textSoft }]}>×</Text>
            </Pressable>
          </View>

          <Text style={[styles.replanSectionLabel, { color: theme.textMuted }]}>
            Huecos sugeridos
          </Text>
          <View style={styles.replanSuggestionsList}>
            {suggestions.map(suggestion => (
              <Pressable
                key={suggestion.label}
                onPress={() => onReschedule(task.id, suggestion)}
                style={[
                  styles.replanSuggestion,
                  { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                ]}>
                <Text style={[styles.replanSuggestionTime, { color: theme.accent }]}>
                  {suggestion.label}
                </Text>
                <Text style={[styles.replanSuggestionMeta, { color: theme.textSoft }]}>
                  {formatMinutes(suggestion.durationMinutes)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.replanSectionLabel, { color: theme.textMuted }]}>
            Otras acciones
          </Text>
          <View style={styles.replanQuickActions}>
            <Pressable
              onPress={() => onMoveToTomorrow(task.id)}
              style={[
                styles.replanActionButton,
                { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
              ]}>
              <Text style={[styles.replanActionText, { color: theme.text }]}>Mañana</Text>
            </Pressable>
            <Pressable
              onPress={() => onMoveToInbox(task.id)}
              style={[
                styles.replanActionButton,
                { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
              ]}>
              <Text style={[styles.replanActionText, { color: theme.text }]}>Inbox</Text>
            </Pressable>
            <Pressable
              onPress={() => onEditTask(task)}
              style={[
                styles.replanActionButton,
                { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
              ]}>
              <Text style={[styles.replanActionText, { color: theme.text }]}>Editar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MiniDateButton({
  theme,
  label,
  helper,
  onPress,
}: {
  theme: Theme;
  label: string;
  helper: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dateArrowButton,
        { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
      ]}>
      <Text style={[styles.dateArrowLabel, { color: theme.text }]}>{label}</Text>
      <Text style={[styles.dateArrowHelper, { color: theme.textMuted }]}>{helper}</Text>
    </Pressable>
  );
}

function SummaryMetric({
  theme,
  icon,
  label,
  value,
  helper,
  pill,
}: {
  theme: Theme;
  icon: string;
  label: string;
  value: string;
  helper?: string;
  pill?: boolean;
}) {
  return (
    <View style={styles.summaryMetric}>
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

function getSuggestedSlots(tasks: Task[], activeTask: Task): SlotSuggestion[] {
  const duration = activeTask.durationMinutes ?? 30;
  const activeTaskId = activeTask.id;
  const dayStart = TIMELINE_START_HOUR * 60;
  const dayEnd = (TIMELINE_END_HOUR + 1) * 60;
  const filteredTasks = tasks
    .filter(task => task.id !== activeTaskId)
    .map(task => ({
      start: task.startHour! * 60 + task.startMinute!,
      end: task.startHour! * 60 + task.startMinute! + task.durationMinutes!,
    }))
    .sort((left, right) => left.start - right.start);

  const suggestions: SlotSuggestion[] = [];
  let cursor = dayStart;

  filteredTasks.forEach(task => {
    if (task.start - cursor >= duration && suggestions.length < 3) {
      suggestions.push(createSlotSuggestion(cursor, duration));
    }
    cursor = Math.max(cursor, task.end);
  });

  if (dayEnd - cursor >= duration && suggestions.length < 3) {
    suggestions.push(createSlotSuggestion(cursor, duration));
  }

  if (!suggestions.length) {
    const fallback = clampTaskStartMinutes(
      activeTask.startHour! * 60 + activeTask.startMinute! + duration,
      duration,
    );
    suggestions.push(createSlotSuggestion(fallback, duration));
  }

  return suggestions;
}

function createSlotSuggestion(startMinutes: number, durationMinutes: number): SlotSuggestion {
  const endMinutes = startMinutes + durationMinutes;
  return {
    label: `${formatClock(startMinutes)} - ${formatClock(endMinutes)}`,
    startHour: Math.floor(startMinutes / 60),
    startMinute: startMinutes % 60,
    durationMinutes,
  };
}

function formatClock(totalMinutes: number) {
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function snapMinutes(rawMinutes: number) {
  return Math.round(rawMinutes / DRAG_STEP_MINUTES) * DRAG_STEP_MINUTES;
}

function clampTaskStartMinutes(startMinutes: number, durationMinutes: number) {
  const dayStart = TIMELINE_START_HOUR * 60;
  const dayEnd = (TIMELINE_END_HOUR + 1) * 60 - durationMinutes;
  return Math.max(dayStart, Math.min(startMinutes, dayEnd));
}

const styles = StyleSheet.create({
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
  datePager: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  dateArrowButton: {
    width: 66,
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateArrowLabel: {
    fontSize: 22,
    fontWeight: '700',
  },
  dateArrowHelper: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  dateFocusCard: {
    flex: 1,
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateFocusWeekday: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateFocusValue: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '700',
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
    marginBottom: 18,
  },
  summaryMetric: {
    flex: 1,
    gap: 8,
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
  replanHintCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 20,
  },
  replanHintTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  replanHintText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
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
  },
  taskHeaderTextWrap: {
    flex: 1,
  },
  taskCheck: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1.5,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  activeTaskTitle: {
    textDecorationLine: 'none',
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
  },
  dragHandle: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  dragHandleText: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 14,
  },
  taskMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
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
  priorityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  priorityPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  subtaskProgressRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  subtaskProgressText: {
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 12,
  },
  miniActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 18, 32, 0.32)',
  },
  replanModalCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 34,
  },
  replanModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  replanModalTitleBlock: {
    flex: 1,
    paddingRight: 16,
  },
  replanModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  replanModalSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  replanModalClose: {
    fontSize: 30,
    lineHeight: 30,
  },
  replanSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  replanSuggestionsList: {
    gap: 10,
    marginBottom: 18,
  },
  replanSuggestion: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  replanSuggestionTime: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  replanSuggestionMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  replanQuickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  replanActionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replanActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  transparentBackground: {
    backgroundColor: 'transparent',
  },
  transparentBorder: {
    borderWidth: 0,
  },
});
