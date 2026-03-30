import { CategoryDefinition } from '../types';

export const TODAY_KEY = '2026-03-30';
export const HOUR_HEIGHT = 92;
export const TIMELINE_START_HOUR = 6;
export const TIMELINE_END_HOUR = 14;

export const durationOptions = [15, 30, 45, 60, 90, 120];
export const hourOptions = Array.from({ length: 18 }, (_, index) => index + 6);
export const minuteOptions = [0, 15, 30, 45];

export const categories: CategoryDefinition[] = [
  {
    id: 'study',
    label: 'Estudio',
    icon: '◫',
    color: '#6EA8FF',
    softColor: '#EAF2FF',
  },
  {
    id: 'work',
    label: 'Trabajo',
    icon: '▣',
    color: '#6366F1',
    softColor: '#EEECFF',
  },
  {
    id: 'personal',
    label: 'Personal',
    icon: '◌',
    color: '#4EC58D',
    softColor: '#E8FFF3',
  },
  {
    id: 'health',
    label: 'Salud',
    icon: '♡',
    color: '#F3A25F',
    softColor: '#FFF2E8',
  },
  {
    id: 'routine',
    label: 'Rutina',
    icon: '↻',
    color: '#8A8EF5',
    softColor: '#EFF0FF',
  },
  {
    id: 'reminder',
    label: 'Recordatorio',
    icon: '◔',
    color: '#9A9FB3',
    softColor: '#F0F2F8',
  },
];
