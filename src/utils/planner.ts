import { categories } from '../constants/planner';
import { CategoryId, EnergyLevel, Task } from '../types';

export function getCategory(categoryId: CategoryId) {
  return categories.find(category => category.id === categoryId) ?? categories[0];
}

export function formatSpanishDate(dateKey: string) {
  const formatter = new Intl.DateTimeFormat('es-DO', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const date = new Date(`${dateKey}T12:00:00`);
  const formatted = formatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) {
    return `${minutes}m`;
  }
  if (!minutes) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

export function durationLabel(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  if (minutes % 60 === 0) {
    return `${minutes / 60} hora${minutes === 60 ? '' : 's'}`;
  }
  return formatMinutes(minutes);
}

export function energyLabel(level: EnergyLevel) {
  if (level === 'low') {
    return 'Baja';
  }
  if (level === 'medium') {
    return 'Media';
  }
  return 'Alta';
}

export function getLoadLabel(tasks: Task[]) {
  const score = tasks.reduce((sum, task) => {
    if (task.energyLevel === 'low') {
      return sum + 1;
    }
    if (task.energyLevel === 'medium') {
      return sum + 2;
    }
    return sum + 3;
  }, 0);

  const average = tasks.length ? score / tasks.length : 0;
  if (average < 1.6) {
    return 'Baja';
  }
  if (average < 2.4) {
    return 'Media';
  }
  return 'Alta';
}

export function formatTaskTime(task: Task) {
  if (task.isAllDay) {
    return 'Todo el día';
  }
  if (
    typeof task.startHour !== 'number' ||
    typeof task.startMinute !== 'number' ||
    typeof task.durationMinutes !== 'number'
  ) {
    return 'Sin hora';
  }

  const startTotal = task.startHour * 60 + task.startMinute;
  const endTotal = startTotal + task.durationMinutes;
  const endHour = Math.floor(endTotal / 60);
  const endMinute = endTotal % 60;

  return `${String(task.startHour).padStart(2, '0')}:${String(task.startMinute).padStart(
    2,
    '0',
  )} - ${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}
