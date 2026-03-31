import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme, TabKey } from '../types';

const tabItems: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'today', label: 'Today', icon: '◫' },
  { key: 'inbox', label: 'Inbox', icon: '▭' },
  { key: 'week', label: 'Week', icon: '☰' },
  { key: 'more', label: 'More', icon: '⚙' },
];

export function BottomNavigation({
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
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomBar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          shadowColor: theme.shadow,
          paddingBottom: Math.max(insets.bottom, 14),
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
    <Pressable
      onPress={onPress}
      style={[
        styles.tabButton,
        active ? { backgroundColor: theme.accentSoft } : null,
      ]}>
      <Text style={[styles.tabIcon, { color: active ? theme.accent : theme.textMuted }]}>
        {item.icon}
      </Text>
      <Text style={[styles.tabLabel, { color: active ? theme.accent : theme.textMuted }]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 18,
  },
  bottomTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabIcon: {
    fontSize: 17,
    fontWeight: '700',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  fabSpacer: {
    width: 82,
  },
  fabButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: -22,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 6,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '400',
  },
});
