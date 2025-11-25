export interface CalendarEvent {
  id: string;
  title: string;
  dayOfWeek?: number;
  date?: string;
  time?: string;
  type: 'work' | 'personal' | 'deadline' | 'other';
  calendarId: string;
  isMagic?: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedTime?: string;
  actualTime?: number;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
