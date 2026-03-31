import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PlannerProfile, Theme, UserType, WeekStartsOn } from '../types';

const userTypeOptions: Array<{ value: UserType; label: string; description: string }> = [
  { value: 'student', label: 'Estudiante', description: 'Clases, estudio y entregas' },
  { value: 'professional', label: 'Profesional', description: 'Trabajo y reuniones' },
  { value: 'freelancer', label: 'Freelancer', description: 'Clientes y bloques flexibles' },
  { value: 'routine', label: 'Rutina', description: 'Hábitos, salud y estructura' },
];

const durationOptions = [30, 45, 60, 90];
const reminderOptions = [null, 5, 10, 15, 30];

export function OnboardingScreen({
  theme,
  initialProfile,
  onComplete,
}: {
  theme: Theme;
  initialProfile: PlannerProfile;
  onComplete: (profile: PlannerProfile) => void;
}) {
  const [profile, setProfile] = useState(initialProfile);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}>
      <Text style={[styles.eyebrow, { color: theme.accent }]}>FlowDay Setup</Text>
      <Text style={[styles.title, { color: theme.text }]}>Organiza la app a tu ritmo</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        Este setup define el perfil inicial del planner para que las sugerencias, la semana y la
        creación rápida se adapten mejor a tu día.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Perfil principal</Text>
      <View style={styles.optionGrid}>
        {userTypeOptions.map(option => {
          const selected = profile.userType === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setProfile(current => ({ ...current, userType: option.value }))}
              style={[
                styles.optionCard,
                {
                  backgroundColor: selected ? theme.accentSoft : theme.surface,
                  borderColor: selected ? theme.accentStrong : theme.border,
                },
              ]}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>{option.label}</Text>
              <Text style={[styles.optionDescription, { color: theme.textMuted }]}>
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Horario habitual</Text>
      <View style={styles.row}>
        <StepperCard
          theme={theme}
          label="Empiezas"
          value={`${String(profile.dayStartHour).padStart(2, '0')}:00`}
          onPrev={() =>
            setProfile(current => ({
              ...current,
              dayStartHour: Math.max(5, current.dayStartHour - 1),
            }))
          }
          onNext={() =>
            setProfile(current => ({
              ...current,
              dayStartHour: Math.min(current.dayEndHour - 1, current.dayStartHour + 1),
            }))
          }
        />
        <StepperCard
          theme={theme}
          label="Terminas"
          value={`${String(profile.dayEndHour).padStart(2, '0')}:00`}
          onPrev={() =>
            setProfile(current => ({
              ...current,
              dayEndHour: Math.max(current.dayStartHour + 1, current.dayEndHour - 1),
            }))
          }
          onNext={() =>
            setProfile(current => ({
              ...current,
              dayEndHour: Math.min(23, current.dayEndHour + 1),
            }))
          }
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Defaults de planificación</Text>
      <PickerCard theme={theme} label="Duración sugerida">
        {durationOptions.map(option => (
          <ChoicePill
            key={option}
            theme={theme}
            selected={profile.defaultDurationMinutes === option}
            label={`${option} min`}
            onPress={() =>
              setProfile(current => ({ ...current, defaultDurationMinutes: option }))
            }
          />
        ))}
      </PickerCard>

      <PickerCard theme={theme} label="Recordatorio por defecto">
        {reminderOptions.map(option => (
          <ChoicePill
            key={String(option)}
            theme={theme}
            selected={profile.defaultReminderMinutes === option}
            label={option === null ? 'Sin aviso' : `${option} min antes`}
            onPress={() =>
              setProfile(current => ({ ...current, defaultReminderMinutes: option }))
            }
          />
        ))}
      </PickerCard>

      <PickerCard theme={theme} label="Inicio de semana">
        {(['monday', 'sunday'] as WeekStartsOn[]).map(option => (
          <ChoicePill
            key={option}
            theme={theme}
            selected={profile.weekStartsOn === option}
            label={option === 'monday' ? 'Lunes' : 'Domingo'}
            onPress={() => setProfile(current => ({ ...current, weekStartsOn: option }))}
          />
        ))}
      </PickerCard>

      <PickerCard theme={theme} label="Notificaciones">
        <ChoicePill
          theme={theme}
          selected={profile.notificationsEnabled}
          label={profile.notificationsEnabled ? 'Activadas' : 'Desactivadas'}
          onPress={() =>
            setProfile(current => ({
              ...current,
              notificationsEnabled: !current.notificationsEnabled,
            }))
          }
        />
      </PickerCard>

      <Pressable
        onPress={() => onComplete(profile)}
        style={[styles.primaryButton, { backgroundColor: theme.accent }]}>
        <Text style={styles.primaryButtonText}>Entrar a FlowDay</Text>
      </Pressable>
    </ScrollView>
  );
}

function StepperCard({
  theme,
  label,
  value,
  onPrev,
  onNext,
}: {
  theme: Theme;
  label: string;
  value: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.stepperBlock}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{label}</Text>
      <View style={[styles.fieldCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Pressable onPress={onPrev} style={[styles.stepperButton, { backgroundColor: theme.surfaceMuted }]}>
          <Text style={[styles.stepperButtonText, { color: theme.text }]}>−</Text>
        </Pressable>
        <Text style={[styles.stepperValue, { color: theme.text }]}>{value}</Text>
        <Pressable onPress={onNext} style={[styles.stepperButton, { backgroundColor: theme.surfaceMuted }]}>
          <Text style={[styles.stepperButtonText, { color: theme.text }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PickerCard({
  theme,
  label,
  children,
}: {
  theme: Theme;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.pickerBlock}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{label}</Text>
      <View style={[styles.pickerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

function ChoicePill({
  theme,
  selected,
  label,
  onPress,
}: {
  theme: Theme;
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choicePill,
        { backgroundColor: selected ? theme.accent : theme.surfaceMuted },
      ]}>
      <Text
        style={[
          styles.choiceText,
          selected ? styles.choiceTextSelected : { color: theme.text },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: { paddingHorizontal: 22, paddingTop: 34, paddingBottom: 44 },
  eyebrow: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  title: { marginTop: 10, fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { marginTop: 10, fontSize: 15, lineHeight: 22, fontWeight: '500' },
  sectionTitle: { marginTop: 28, marginBottom: 12, fontSize: 18, fontWeight: '700' },
  optionGrid: { gap: 12 },
  optionCard: { borderRadius: 22, borderWidth: 1, padding: 16 },
  optionTitle: { fontSize: 17, fontWeight: '700' },
  optionDescription: { marginTop: 6, fontSize: 13, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 12 },
  stepperBlock: { flex: 1 },
  fieldLabel: { marginBottom: 8, fontSize: 13, fontWeight: '700' },
  fieldCard: {
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 72,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  stepperButtonText: { fontSize: 22, fontWeight: '700' },
  stepperValue: { fontSize: 18, fontWeight: '700' },
  pickerBlock: { marginTop: 4, marginBottom: 16 },
  pickerCard: { borderRadius: 20, borderWidth: 1, padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choicePill: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  choiceText: { fontSize: 14, fontWeight: '700' },
  choiceTextSelected: { color: '#FFFFFF' },
  primaryButton: { marginTop: 18, minHeight: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
