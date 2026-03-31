import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Theme, Task } from '../types';
import { getCategory, getPriorityColor, priorityLabel } from '../utils/planner';

export function InboxScreen({
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
            <View style={styles.inboxHeader}>
              <Text style={[styles.inboxTitle, { color: theme.text }]}>{task.title}</Text>
              <View
                style={[
                  styles.priorityPill,
                  { backgroundColor: getPriorityColor(task.priority) },
                ]}>
                <Text style={styles.priorityPillText}>{priorityLabel(task.priority)}</Text>
              </View>
            </View>
            {task.subtasks.length ? (
              <Text style={[styles.subtaskSummary, { color: theme.textMuted }]}>
                {task.subtasks.filter(subtask => subtask.completed).length}/{task.subtasks.length}{' '}
                subtareas
              </Text>
            ) : null}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 140,
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
  inboxHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  inboxTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  priorityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  priorityPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  subtaskSummary: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  inboxFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
});
