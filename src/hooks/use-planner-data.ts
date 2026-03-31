import { useMemo } from 'react';
import { useFlowDay } from '../store/flowday-context';
import { getLoadLabel } from '../utils/planner';
import {
  formatMonthLabel,
  getMonthDateKeys,
  getWeekDateKeys,
  isSameMonth,
} from '../utils/dates';

export function usePlannerData() {
  const { tasks, selectedDate } = useFlowDay();

  return useMemo(() => {
    const todayTasks = tasks.filter(task => task.date === selectedDate && !task.inInbox);
    const inboxTasks = tasks.filter(task => task.inInbox);
    const completedToday = todayTasks.filter(task => task.completed).length;
    const completionRate = todayTasks.length
      ? Math.round((completedToday / todayTasks.length) * 100)
      : 0;
    const plannedMinutes = todayTasks.reduce(
      (sum, task) => sum + (task.durationMinutes ?? 0),
      0,
    );
    const loadLabel = getLoadLabel(todayTasks);
    const nextTask =
      todayTasks.find(task => !task.completed && typeof task.startHour === 'number') ?? null;
    const weekDateKeys = getWeekDateKeys(selectedDate);
    const weekOverview = weekDateKeys.map(dateKey => {
      const dayTasks = tasks.filter(task => task.date === dateKey && !task.inInbox);
      const plannedMinutesForDay = dayTasks.reduce(
        (sum, task) => sum + (task.durationMinutes ?? 0),
        0,
      );

      return {
        dateKey,
        tasks: dayTasks,
        plannedMinutes: plannedMinutesForDay,
      };
    });
    const monthDateKeys = getMonthDateKeys(selectedDate);
    const monthOverview = monthDateKeys.map(dateKey => {
      const dayTasks = tasks.filter(task => task.date === dateKey && !task.inInbox);
      return {
        dateKey,
        taskCount: dayTasks.length,
        completedCount: dayTasks.filter(task => task.completed).length,
        inCurrentMonth: isSameMonth(dateKey, selectedDate),
      };
    });

    return {
      todayTasks,
      inboxTasks,
      selectedDate,
      completionRate,
      plannedMinutes,
      loadLabel,
      nextTask,
      weekOverview,
      monthOverview,
      monthLabel: formatMonthLabel(selectedDate),
    };
  }, [selectedDate, tasks]);
}
