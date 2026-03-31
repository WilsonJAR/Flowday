import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Theme, Task } from '../types';
import {
  formatDayNumber,
  formatMonthLabel,
  formatWeekdayShort,
} from '../utils/dates';
import { formatMinutes, getCategory } from '../utils/planner';

export function WeekScreen({
  theme,
  selectedDate,
  weekOverview,
  monthOverview,
  onSelectDate,
}: {
  theme: Theme;
  selectedDate: string;
  weekOverview: Array<{ dateKey: string; tasks: Task[]; plannedMinutes: number }>;
  monthOverview: Array<{
    dateKey: string;
    taskCount: number;
    completedCount: number;
    inCurrentMonth: boolean;
  }>;
  onSelectDate: (dateKey: string) => void;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeadingBlock}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Week</Text>
        <Text style={[styles.pageSubtitle, { color: theme.textMuted }]}>
          {formatMonthLabel(selectedDate)}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.weekRow}>
          {weekOverview.map(day => (
            <Pressable
              key={day.dateKey}
              onPress={() => onSelectDate(day.dateKey)}
              style={[
                styles.weekDayCard,
                {
                  backgroundColor: theme.surface,
                  borderColor:
                    day.dateKey === selectedDate ? theme.accentStrong : theme.border,
                  shadowColor: theme.shadow,
                },
              ]}>
              <Text style={[styles.weekDayLabel, { color: theme.textMuted }]}>
                {formatWeekdayShort(day.dateKey)}
              </Text>
              <Text style={[styles.weekDayDate, { color: theme.text }]}>
                {formatDayNumber(day.dateKey)}
              </Text>
              <View style={styles.weekBarsBlock}>
                {day.tasks.length ? (
                  day.tasks.slice(0, 3).map((task, index) => (
                    <View
                      key={`${day.dateKey}-${index}`}
                      style={[
                        styles.weekBar,
                        { backgroundColor: getCategory(task.categoryId).color },
                      ]}
                    />
                  ))
                ) : (
                  <Text style={[styles.weekEmptyMark, { color: theme.border }]}>—</Text>
                )}
              </View>
              <Text style={[styles.weekMeta, { color: theme.textMuted }]}>
                {day.tasks.length
                  ? `${day.tasks.length} tareas · ${formatMinutes(day.plannedMinutes)}`
                  : '-'}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.weekSummaryCard,
          { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
        ]}>
        <Text style={[styles.weekSummaryTitle, { color: theme.textSoft }]}>
          Overview mensual
        </Text>
        <View style={styles.monthGrid}>
          {monthOverview.map(day => (
            <Pressable
              key={day.dateKey}
              onPress={() => onSelectDate(day.dateKey)}
              style={[
                styles.monthCell,
                day.inCurrentMonth ? styles.monthCellCurrent : styles.monthCellMuted,
                {
                  backgroundColor:
                    day.dateKey === selectedDate ? theme.accentSoft : theme.surface,
                  borderColor:
                    day.dateKey === selectedDate ? theme.accentStrong : theme.border,
                },
              ]}>
              <Text style={[styles.monthCellDay, { color: theme.text }]}>
                {formatDayNumber(day.dateKey)}
              </Text>
              <Text style={[styles.monthCellMeta, { color: theme.textMuted }]}>
                {day.taskCount ? `${day.completedCount}/${day.taskCount}` : '—'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
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
    paddingBottom: 190,
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
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  monthCell: {
    width: '13%',
    minWidth: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  monthCellCurrent: {
    opacity: 1,
  },
  monthCellMuted: {
    opacity: 0.45,
  },
  monthCellDay: {
    fontSize: 14,
    fontWeight: '700',
  },
  monthCellMeta: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '700',
  },
});
