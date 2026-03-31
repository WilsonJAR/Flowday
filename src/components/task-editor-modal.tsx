import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { categories, durationOptions, hourOptions, minuteOptions } from '../constants/planner';
import { EditorState, EnergyLevel, Theme } from '../types';
import { durationLabel, energyLabel } from '../utils/planner';

const reminderOptions: Array<number | null> = [null, 5, 10, 15, 30, 60];

export function TaskEditorModal({
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
                    <Text style={[styles.categoryChipText, categoryChipTextStyle]}>
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
                    <Text style={[styles.energyChipText, energyChipTextStyle]}>
                      {energyLabel(level)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
              Recordatorio
            </Text>
            <View style={styles.energyRow}>
              {reminderOptions.map(option => {
                const selected = editorState.reminderMinutesBefore === option;
                const label = option === null ? 'No' : `${option}m`;
                return (
                  <Pressable
                    key={String(option)}
                    onPress={() =>
                      onChange({ ...editorState, reminderMinutesBefore: option })
                    }
                    style={[
                      styles.energyChip,
                      {
                        backgroundColor: selected ? theme.accent : theme.surfaceMuted,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.energyChipText,
                        selected ? styles.selectedChipText : { color: theme.text },
                      ]}>
                      {label}
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

const styles = StyleSheet.create({
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
});
