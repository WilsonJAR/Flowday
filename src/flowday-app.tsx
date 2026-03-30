import React from 'react';
import { StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from './components/bottom-navigation';
import { TaskEditorModal } from './components/task-editor-modal';
import { usePlannerData } from './hooks/use-planner-data';
import { InboxScreen } from './screens/inbox-screen';
import { MoreScreen } from './screens/more-screen';
import { TodayScreen } from './screens/today-screen';
import { WeekScreen } from './screens/week-screen';
import { FlowDayProvider, useFlowDay } from './store/flowday-context';
import { darkTheme, lightTheme } from './theme/themes';

function FlowDayShell() {
  const {
    activeTab,
    editorVisible,
    editorState,
    isDarkMode,
    setActiveTab,
    setIsDarkMode,
    setEditorState,
    openCreateModal,
    openEditModal,
    closeEditor,
    saveTask,
    toggleTaskComplete,
    moveTaskToInbox,
    duplicateTask,
    scheduleInboxTask,
  } = useFlowDay();
  const { todayTasks, inboxTasks, completionRate, plannedMinutes, loadLabel, nextTask } =
    usePlannerData();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <View style={styles.appShell}>
        <View style={styles.contentArea}>
          {activeTab === 'today' ? (
            <TodayScreen
              theme={theme}
              tasks={todayTasks}
              completionRate={completionRate}
              plannedMinutes={plannedMinutes}
              loadLabel={loadLabel}
              nextTask={nextTask}
              onEditTask={openEditModal}
              onToggleComplete={toggleTaskComplete}
              onDuplicateTask={duplicateTask}
              onMoveToInbox={moveTaskToInbox}
            />
          ) : null}
          {activeTab === 'inbox' ? (
            <InboxScreen
              theme={theme}
              tasks={inboxTasks}
              onAddTask={() => openCreateModal(true)}
              onEditTask={openEditModal}
              onScheduleTask={scheduleInboxTask}
            />
          ) : null}
          {activeTab === 'week' ? <WeekScreen theme={theme} tasks={todayTasks} /> : null}
          {activeTab === 'more' ? (
            <MoreScreen
              theme={theme}
              isDarkMode={isDarkMode}
              onToggleTheme={setIsDarkMode}
            />
          ) : null}
        </View>

        <BottomNavigation
          theme={theme}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenEditor={() => openCreateModal(activeTab === 'inbox')}
        />

        <TaskEditorModal
          visible={editorVisible}
          theme={theme}
          editorState={editorState}
          onClose={closeEditor}
          onSave={saveTask}
          onChange={setEditorState}
        />
      </View>
    </SafeAreaView>
  );
}

export default function FlowDayApp() {
  const systemScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <FlowDayProvider initialDarkMode={systemScheme === 'dark'}>
        <FlowDayShell />
      </FlowDayProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appShell: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
});
