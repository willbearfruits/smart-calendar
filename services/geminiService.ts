import { ExtractedData, Task, CalendarEvent, ChatMessage } from "../types";

// Backend API URL - can be configured via environment variable
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Analyzes an image containing handwritten notes and extracts tasks and events
 */
export const analyzeImage = async (base64Image: string): Promise<ExtractedData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<ExtractedData> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to analyze image');
    }

    return result.data;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

/**
 * Generates AI-suggested schedule for uncompleted tasks
 */
export const suggestSchedule = async (
  tasks: Task[],
  existingEvents: CalendarEvent[],
  currentDateStr: string
): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/suggest-schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks,
        existingEvents,
        currentDate: currentDateStr
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<CalendarEvent[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to generate schedule');
    }

    return result.data || [];
  } catch (error) {
    console.error("Error generating schedule:", error);
    return [];
  }
};

/**
 * Chats with AI assistant about tasks and schedule
 */
export const chatWithAI = async (
    messages: ChatMessage[],
    tasks: Task[],
    events: CalendarEvent[],
    currentDateStr: string
): Promise<{ text: string, toolCalls?: any[] }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            tasks,
            events,
            currentDate: currentDateStr
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse<{ text: string, toolCalls?: any[] }> = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to process chat');
        }

        return result.data;
    } catch (e) {
        console.error(e);
        return { text: "Sorry, I'm having trouble connecting to the server right now." };
    }
};

/**
 * Estimates the duration for a given task
 */
export const estimateTaskDuration = async (taskTitle: string): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/estimate-duration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskTitle }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse<string> = await response.json();

        if (!result.success || !result.data) {
          return "?";
        }

        return result.data;
    } catch (e) {
        console.error(e);
        return "?";
    }
}
