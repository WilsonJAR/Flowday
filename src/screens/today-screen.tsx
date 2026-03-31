import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  onSelectDate,
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
  onSelectDate: (dateKey: string) => void;
  onStartFocus: (task: Task) => void;
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
              const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
              const hasSubtasks = task.subtasks.length > 0;

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
                      label="Inbox"
                      color={theme.accent}
                      onPress={() => onMoveToInbox(task.id)}
                    />
                    {!task.completed ? (
                      <MiniAction
                        label="Focus"
                        color={category.color}
                        onPress={() => onStartFocus(task)}
                      />
                    ) : null}
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
    marginBottom: 24,
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
    marginTop: 10,
  },
  miniActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  transparentBackground: {
    backgroundColor: 'transparent',
  },
  transparentBorder: {
    borderColor: 'transparent',
  },
});
