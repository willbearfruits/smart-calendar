export interface CalendarEvent {
  id: string;
  title: string;
  dayOfWeek?: number; // 0 (Sunday) - 6 (Saturday)
  date?: string; // ISO string if specific date
  time?: string;
  type: 'work' | 'personal' | 'deadline' | 'other';
  calendarId: string;
  isMagic?: boolean; // Tag for AI generated events
}

export interface CalendarConfig {
  id: string;
  name: string;
  color: string; // Tailwind color name (e.g. 'indigo', 'teal')
  isVisible: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedTime?: string; // AI estimation
  actualTime?: number; // In seconds
  isTimerRunning?: boolean;
  lastStartTime?: number;
}

export interface ExtractedData {
  tasks: string[];
  events: {
    title: string;
    dayOfWeek?: number;
    time?: string;
    recurrence?: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export enum ViewMode {
  DIGITAL = 'DIGITAL',
  PRINT_PREVIEW = 'PRINT_PREVIEW'
}

export enum DigitalViewMode {
  MONTH = 'MONTH',
  WEEK = 'WEEK',
  DAY = 'DAY'
}

export type Theme = 'light' | 'dark' | 'midnight';
