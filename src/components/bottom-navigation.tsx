import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Theme, TabKey } from '../types';

const tabItems: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'today', label: 'Today', icon: '⌂' },
  { key: 'inbox', label: 'Inbox', icon: '▱' },
  { key: 'week', label: 'Week', icon: '☷' },
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
  return (
    <View
      style={[
        styles.bottomBar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          shadowColor: theme.shadow,
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
    <Pressable onPress={onPress} style={styles.tabButton}>
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
    paddingTop: 14,
    paddingBottom: 18,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 18,
  },
  bottomTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  tabButton: {
    width: 74,
    alignItems: 'center',
    gap: 6,
  },
  tabIcon: {
    fontSize: 21,
    fontWeight: '600',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  fabSpacer: {
    width: 88,
  },
  fabButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: -28,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 6,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '300',
  },
});
