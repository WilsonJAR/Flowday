import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Theme, Task } from '../types';
import { formatMinutes, getCategory } from '../utils/planner';

export function FocusScreen({
  theme,
  task,
  durationMinutes,
  onComplete,
  onCancel,
}: {
  theme: Theme;
  task: Task;
  durationMinutes: number;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const category = getCategory(task.categoryId);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(current => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progress = 1 - secondsLeft / Math.max(durationMinutes * 60, 1);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.textMuted }]}>Focus Mode</Text>
        <Text style={[styles.title, { color: theme.text }]}>{task.title}</Text>
        <View style={[styles.categoryPill, { backgroundColor: category.softColor }]}>
          <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
        </View>

        <Text style={[styles.timer, { color: theme.text }]}>{formatTime(secondsLeft)}</Text>
        <Text style={[styles.helper, { color: theme.textMuted }]}>
          Sesión planeada: {formatMinutes(durationMinutes)}
        </Text>

        <View style={[styles.progressTrack, { backgroundColor: theme.surfaceMuted }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.accent,
                width: `${Math.max(progress * 100, 4)}%`,
              },
            ]}
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onCancel}
            style={[styles.secondaryButton, { borderColor: theme.border }]}>
            <Text style={[styles.secondaryText, { color: theme.text }]}>Salir</Text>
          </Pressable>
          <Pressable
            onPress={onComplete}
            style={[styles.primaryButton, { backgroundColor: theme.accent }]}>
            <Text style={styles.primaryText}>Completar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', paddingHorizontal: 22 },
  card: { borderRadius: 28, borderWidth: 1, padding: 24, alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  title: { marginTop: 10, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  categoryPill: { marginTop: 14, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  categoryText: { fontSize: 12, fontWeight: '700' },
  timer: { marginTop: 26, fontSize: 54, fontWeight: '800', letterSpacing: -1.4 },
  helper: { marginTop: 8, fontSize: 14, fontWeight: '500' },
  progressTrack: { width: '100%', height: 10, borderRadius: 999, marginTop: 24, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 28 },
  secondaryButton: {
    minWidth: 120,
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { fontSize: 15, fontWeight: '700' },
  primaryButton: {
    minWidth: 140,
    minHeight: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
