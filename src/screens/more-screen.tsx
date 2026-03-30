import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Theme } from '../types';

export function MoreScreen({
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
});
