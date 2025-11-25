import { Task, CalendarEvent, CalendarConfig } from '../types';

export const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Review project requirements', completed: false, actualTime: 0, isTimerRunning: false },
  { id: '2', title: 'Prepare presentation slides', completed: false, actualTime: 0, isTimerRunning: false },
  { id: '3', title: 'Schedule team meeting', completed: false, actualTime: 0, isTimerRunning: false },
  { id: '4', title: 'Update project documentation', completed: false, actualTime: 0, isTimerRunning: false },
  { id: '5', title: 'Review code changes', completed: false, actualTime: 0, isTimerRunning: false },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Team Standup', dayOfWeek: 1, type: 'work', time: '09:00 - 09:30', calendarId: 'team' },
  { id: '2', title: 'Project Review', dayOfWeek: 3, type: 'work', time: '14:00 - 15:00', calendarId: 'team' },
  { id: '3', title: 'Weekly Planning', dayOfWeek: 5, type: 'work', time: '10:00 - 11:00', calendarId: 'personal' },
];

export const INITIAL_CALENDARS: CalendarConfig[] = [
  { id: 'personal', name: 'Personal', color: 'indigo', isVisible: true },
  { id: 'team', name: 'Team', color: 'teal', isVisible: true },
  { id: 'magic', name: 'Magic ✨', color: 'rose', isVisible: true },
];

export const STORAGE_KEYS = {
  TASKS: 'smart_calendar_tasks',
  EVENTS: 'smart_calendar_events',
  CALENDARS: 'smart_calendar_calendars',
  THEME: 'smart_calendar_theme',
} as const;

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
