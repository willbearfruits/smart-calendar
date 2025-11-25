import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { ExtractedData, Task, CalendarEvent, ChatMessage } from "../types/index.js";
import { isAIAvailable, getProviderInfo } from "./unifiedAIService.js";

// Dynamically import provider config
import { getProviderConfig } from "../config/aiProviders.js";

// Initialize AI client based on current provider
function getAIClient() {
  const config = getProviderConfig();
  if (config.provider === 'gemini' && config.apiKey) {
    return new GoogleGenAI({ apiKey: config.apiKey });
  }
  return null;
}

const modelName = "gemini-2.5-flash";

// Helper to check if AI is available
function checkAIAvailable(): void {
  if (!isAIAvailable()) {
    throw new Error('AI features are disabled. Please configure your AI provider in Settings.');
  }
}

// Helper to check if Gemini-specific features are available
function checkGeminiAvailable(): void {
  const config = getProviderConfig();
  if (config.provider !== 'gemini' || !config.apiKey) {
    throw new Error('This feature requires Gemini AI provider. Advanced features like tool calling are only available with Gemini.');
  }
}

const addCalendarEventTool: FunctionDeclaration = {
  name: 'addCalendarEvent',
  description: 'Adds a new event to the user\'s calendar. Use this when the user explicitly asks to schedule something or add an event.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The name of the event" },
      dayOfWeek: { type: Type.INTEGER, description: "0=Sunday, 1=Monday, ..., 6=Saturday. Use this for recurring events or if a specific date isn't year-bound." },
      date: { type: Type.STRING, description: "Specific date in YYYY-MM-DD format. Use this if a specific date is mentioned (e.g. 'November 24th')." },
      time: { type: Type.STRING, description: "Time string (e.g. '14:00', '2 PM'). Defaults to 'All Day' if not specified." },
      type: { type: Type.STRING, enum: ['work', 'personal', 'deadline', 'other'], description: "Category of the event" }
    },
    required: ['title']
  }
};

export const analyzeImage = async (base64Image: string): Promise<ExtractedData> => {
  checkGeminiAvailable(); // Image analysis requires Gemini
  const ai = getAIClient();

  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  try {
    const response = await ai!.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: `Analyze this handwritten note. It contains a list of tasks and a schedule.
            Extract the "Tasks" into a list.
            Extract "Events" or schedule items. If a day is mentioned (e.g., Sunday, Wednesday), map it to a dayOfWeek integer (0=Sunday, 1=Monday, ... 6=Saturday).
            If a time is mentioned, include it.
            Return a JSON object.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  dayOfWeek: { type: Type.INTEGER, description: "0 for Sunday, 1 for Monday, etc." },
                  time: { type: Type.STRING },
                  recurrence: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as ExtractedData;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

export const suggestSchedule = async (
  tasks: Task[],
  existingEvents: CalendarEvent[],
  currentDateStr: string
): Promise<CalendarEvent[]> => {
  checkGeminiAvailable(); // Structured output requires Gemini
  const ai = getAIClient();

  try {
    const uncompletedTasks = tasks.filter(t => !t.completed).map(t => t.title);
    if (uncompletedTasks.length === 0) return [];

    const response = await ai!.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              text: `I have a list of tasks and a current schedule of events.
              Please act as a productivity assistant and assign the uncompleted tasks to empty time slots in the schedule.

              Current Date Context: ${currentDateStr}

              Uncompleted Tasks:
              ${JSON.stringify(uncompletedTasks)}

              Current Schedule (Recurring Weekly Events):
              ${JSON.stringify(existingEvents.map(e => ({ title: e.title, day: e.dayOfWeek, time: e.time })))}

              Rules:
              1. Distribute tasks across the week (0=Sunday to 6=Saturday).
              2. Avoid conflicting with existing events.
              3. Assign reasonable times (e.g., 09:00, 14:00).
              4. Return a list of NEW events to add. Do not return existing events.
              5. Use "dayOfWeek" for the suggested day.
              `
            }
          ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                newEvents: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      dayOfWeek: { type: Type.INTEGER },
                      time: { type: Type.STRING },
                      reasoning: { type: Type.STRING, description: "Why this slot was chosen" }
                    },
                    required: ["title", "dayOfWeek", "time"]
                  }
                }
              }
            }
        }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    return data.newEvents.map((evt: any, index: number) => ({
        id: `magic-${Date.now()}-${index}`,
        title: evt.title,
        dayOfWeek: evt.dayOfWeek,
        time: evt.time,
        type: 'work',
        calendarId: 'magic',
        isMagic: true
    }));

  } catch (error) {
    console.error("Error generating schedule:", error);
    return [];
  }
};

export const chatWithAI = async (
    messages: ChatMessage[],
    tasks: Task[],
    events: CalendarEvent[],
    currentDateStr: string
): Promise<{ text: string, toolCalls?: any[] }> => {
    checkGeminiAvailable(); // Tool calling requires Gemini
    const ai = getAIClient();

    try {
        const context = `
        You are a smart and helpful productivity assistant for the "Smart Calendar" app.
        Current Date: ${currentDateStr}

        Your Capabilities:
        1. Answer questions about the user's schedule.
        2. Help breakdown tasks.
        3. ADD EVENTS to the calendar using the "addCalendarEvent" tool.

        Current Tasks: ${JSON.stringify(tasks.filter(t => !t.completed).map(t => t.title))}
        Current Events: ${JSON.stringify(events.map(e => `${e.title} on ${e.date ? e.date : 'Day ' + e.dayOfWeek} at ${e.time}`))}

        If the user asks to schedule something, ALWAYS use the "addCalendarEvent" tool.
        `;

        const chat = ai!.chats.create({
            model: modelName,
            config: {
                systemInstruction: context,
                tools: [{ functionDeclarations: [addCalendarEventTool] }]
            }
        });

        const userMessage = messages[messages.length - 1].content;

        const response = await chat.sendMessage({ message: userMessage });

        return {
            text: response.text || "",
            toolCalls: response.functionCalls
        };
    } catch (e) {
        console.error(e);
        return { text: "Sorry, I'm having trouble connecting right now." };
    }
};

export const estimateTaskDuration = async (taskTitle: string): Promise<string> => {
    checkGeminiAvailable(); // This feature requires Gemini
    const ai = getAIClient();

    try {
        const response = await ai!.models.generateContent({
            model: modelName,
            contents: `Estimate how long this task typically takes. Return ONLY the time duration (e.g. "2 hours", "30 mins", "1-2 days"). Task: "${taskTitle}"`
        });
        return response.text || "";
    } catch (e) {
        return "?";
    }
};
