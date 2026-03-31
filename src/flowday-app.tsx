import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from './components/bottom-navigation';
import { TaskEditorModal } from './components/task-editor-modal';
import { usePlannerData } from './hooks/use-planner-data';
import { InboxScreen } from './screens/inbox-screen';
import { FocusScreen } from './screens/focus-screen';
import { MoreScreen } from './screens/more-screen';
import { OnboardingScreen } from './screens/onboarding-screen';
import { TodayScreen } from './screens/today-screen';
import { WeekScreen } from './screens/week-screen';
import { FlowDayProvider, useFlowDay } from './store/flowday-context';
import { darkTheme, lightTheme } from './theme/themes';
import { TabKey } from './types';

type RootTabParamList = {
  Today: undefined;
  Inbox: undefined;
  Week: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function routeNameForTab(tab: TabKey): keyof RootTabParamList {
  if (tab === 'inbox') {
    return 'Inbox';
  }
  if (tab === 'week') {
    return 'Week';
  }
  if (tab === 'more') {
    return 'More';
  }
  return 'Today';
}

function tabForRouteName(routeName: keyof RootTabParamList): TabKey {
  if (routeName === 'Inbox') {
    return 'inbox';
  }
  if (routeName === 'Week') {
    return 'week';
  }
  if (routeName === 'More') {
    return 'more';
  }
  return 'today';
}

function AppTabBar({
  theme,
  openCreateModal,
  setActiveTab,
  navigation,
  state,
}: BottomTabBarProps & {
  theme: typeof lightTheme;
  openCreateModal: (inInbox?: boolean) => void;
  setActiveTab: (tab: TabKey) => void;
}) {
  const currentRouteName = state.routes[state.index].name as keyof RootTabParamList;
  const currentTab = tabForRouteName(currentRouteName);

  return (
    <BottomNavigation
      theme={theme}
      activeTab={currentTab}
      onChangeTab={tab => {
        setActiveTab(tab);
        navigation.navigate(routeNameForTab(tab));
      }}
      onOpenEditor={() => openCreateModal(currentTab === 'inbox')}
    />
  );
}

function TodayTabScreen() {
  const {
    openEditModal,
    toggleTaskComplete,
    duplicateTask,
    moveTaskToInbox,
    moveTaskToTomorrow,
    rescheduleTask,
    startFocusSession,
    isDarkMode,
  } = useFlowDay();
  const { todayTasks, selectedDate, completionRate, plannedMinutes, loadLabel, nextTask } =
    usePlannerData();
  const { setSelectedDate } = useFlowDay();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <TodayScreen
      theme={theme}
      selectedDate={selectedDate}
      tasks={todayTasks}
      completionRate={completionRate}
      plannedMinutes={plannedMinutes}
      loadLabel={loadLabel}
      nextTask={nextTask}
      onEditTask={openEditModal}
      onToggleComplete={toggleTaskComplete}
      onDuplicateTask={duplicateTask}
      onMoveToInbox={moveTaskToInbox}
      onMoveToTomorrow={moveTaskToTomorrow}
      onSelectDate={setSelectedDate}
      onRescheduleTask={rescheduleTask}
      onStartFocus={startFocusSession}
    />
  );
}

function InboxTabScreen() {
  const { openCreateModal, openEditModal, scheduleInboxTask, isDarkMode } = useFlowDay();
  const { inboxTasks } = usePlannerData();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <InboxScreen
      theme={theme}
      tasks={inboxTasks}
      onAddTask={() => openCreateModal(true)}
      onEditTask={openEditModal}
      onScheduleTask={scheduleInboxTask}
    />
  );
}

function WeekTabScreen() {
  const { isDarkMode, setSelectedDate } = useFlowDay();
  const { selectedDate, weekOverview, monthOverview } = usePlannerData();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <WeekScreen
      theme={theme}
      selectedDate={selectedDate}
      weekOverview={weekOverview}
      monthOverview={monthOverview}
      onSelectDate={setSelectedDate}
    />
  );
}

function MoreTabScreen() {
  const {
    isDarkMode,
    setIsDarkMode,
    profile,
    onboardingCompleted,
    reopenOnboarding,
    completeOnboarding,
  } = useFlowDay();
  const { focusMinutesThisWeek, completedTasksThisWeek, totalFocusSessions } = usePlannerData();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <MoreScreen
      theme={theme}
      isDarkMode={isDarkMode}
      profile={profile}
      onboardingCompleted={onboardingCompleted}
      focusMinutesThisWeek={focusMinutesThisWeek}
      completedTasksThisWeek={completedTasksThisWeek}
      totalFocusSessions={totalFocusSessions}
      onToggleTheme={setIsDarkMode}
      onToggleNotifications={value =>
        completeOnboarding({ ...profile, notificationsEnabled: value })
      }
      onOpenOnboarding={reopenOnboarding}
    />
  );
}

function FlowDayShell() {
  const {
    activeTab,
    editorVisible,
    editorState,
    isDarkMode,
    isHydrated,
    onboardingCompleted,
    profile,
    activeFocusTaskId,
    completeFocusSession,
    cancelFocusSession,
    setActiveTab,
    setEditorState,
    completeOnboarding,
    openCreateModal,
    closeEditor,
    saveTask,
  } = useFlowDay();
  const { todayTasks } = usePlannerData();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const navigationRef = useNavigationContainerRef<RootTabParamList>();
  const activeFocusTask =
    todayTasks.find(task => task.id === activeFocusTaskId) ??
    null;

  useEffect(() => {
    if (!isHydrated || !navigationRef.isReady()) {
      return;
    }

    const nextRoute = routeNameForTab(activeTab);
    const currentRoute = navigationRef.getCurrentRoute()?.name;
    if (currentRoute !== nextRoute) {
      navigationRef.navigate(nextRoute);
    }
  }, [activeTab, isHydrated, navigationRef]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!onboardingCompleted) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <OnboardingScreen
          theme={theme}
          initialProfile={profile}
          onComplete={completeOnboarding}
        />
      </SafeAreaView>
    );
  }

  if (activeFocusTask) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <FocusScreen
          theme={theme}
          task={activeFocusTask}
          durationMinutes={activeFocusTask.durationMinutes ?? profile.defaultDurationMinutes}
          onComplete={() => completeFocusSession(activeFocusTask.id)}
          onCancel={cancelFocusSession}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <View style={styles.appShell}>
        <NavigationContainer
          ref={navigationRef}
          onStateChange={() => {
            const currentRoute = navigationRef.getCurrentRoute()
              ?.name as keyof RootTabParamList | undefined;
            if (currentRoute) {
              setActiveTab(tabForRouteName(currentRoute));
            }
          }}>
          <Tab.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={routeNameForTab(activeTab)}
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBar={props => (
              <AppTabBar
                {...props}
                theme={theme}
                openCreateModal={openCreateModal}
                setActiveTab={setActiveTab}
              />
            )}>
            <Tab.Screen name="Today" component={TodayTabScreen} />
            <Tab.Screen name="Inbox" component={InboxTabScreen} />
            <Tab.Screen name="Week" component={WeekTabScreen} />
            <Tab.Screen name="More" component={MoreTabScreen} />
          </Tab.Navigator>
        </NavigationContainer>

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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
