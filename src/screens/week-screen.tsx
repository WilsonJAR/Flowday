import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Theme, Task } from '../types';

export function WeekScreen({ theme, tasks }: { theme: Theme; tasks: Task[] }) {
  const weekDays = [
    { label: 'Lun', date: '25', bars: [] as string[], meta: '-' },
    { label: 'Mar', date: '26', bars: ['#F3A25F', '#8A8EF5', '#8A8EF5'], meta: '7 tareas · 6h' },
    { label: 'Mié', date: '27', bars: [] as string[], meta: '-' },
    { label: 'Jue', date: '28', bars: [] as string[], meta: '-' },
    { label: 'Vie', date: '29', bars: [] as string[], meta: '-' },
    { label: 'Sáb', date: '30', bars: [], meta: '-' },
    { label: 'Dom', date: '31', bars: [], meta: '-' },
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
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
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
});
