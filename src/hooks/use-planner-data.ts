import { useMemo } from 'react';
import { TODAY_KEY } from '../constants/planner';
import { useFlowDay } from '../store/flowday-context';
import { getLoadLabel } from '../utils/planner';

export function usePlannerData() {
  const { tasks } = useFlowDay();

  return useMemo(() => {
    const todayTasks = tasks.filter(task => task.date === TODAY_KEY && !task.inInbox);
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

    return {
      todayTasks,
      inboxTasks,
      completionRate,
      plannedMinutes,
      loadLabel,
      nextTask,
    };
  }, [tasks]);
}
