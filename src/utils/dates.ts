const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toLocalDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

export function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

export function shiftDateKey(dateKey: string, offsetDays: number) {
  const nextDate = new Date(toLocalDate(dateKey).getTime() + offsetDays * MS_PER_DAY);
  return nextDate.toISOString().slice(0, 10);
}

export function getStartOfWeek(dateKey: string) {
  const date = toLocalDate(dateKey);
  const weekday = date.getDay();
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
  return shiftDateKey(dateKey, diffToMonday);
}

export function getWeekDateKeys(dateKey: string) {
  const start = getStartOfWeek(dateKey);
  return Array.from({ length: 7 }, (_, index) => shiftDateKey(start, index));
}

export function getMonthDateKeys(dateKey: string) {
  const date = toLocalDate(dateKey);
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1, 12);
  const monthStartKey = monthStart.toISOString().slice(0, 10);
  const gridStart = getStartOfWeek(monthStartKey);
  return Array.from({ length: 35 }, (_, index) => shiftDateKey(gridStart, index));
}

export function isSameMonth(dateKey: string, referenceKey: string) {
  const date = toLocalDate(dateKey);
  const reference = toLocalDate(referenceKey);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
}

export function formatSpanishDate(dateKey: string) {
  const formatter = new Intl.DateTimeFormat('es-DO', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formatted = formatter.format(toLocalDate(dateKey));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatDayNumber(dateKey: string) {
  return String(toLocalDate(dateKey).getDate());
}

export function formatWeekdayShort(dateKey: string) {
  return new Intl.DateTimeFormat('es-DO', { weekday: 'short' })
    .format(toLocalDate(dateKey))
    .replace('.', '');
}

export function formatMonthLabel(dateKey: string) {
  const formatted = new Intl.DateTimeFormat('es-DO', {
    month: 'long',
    year: 'numeric',
  }).format(toLocalDate(dateKey));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
