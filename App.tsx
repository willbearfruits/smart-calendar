import React, { useState, useRef, useEffect } from 'react';
import { CalendarEvent, Task, ViewMode, DigitalViewMode, CalendarConfig, ChatMessage, Theme } from './types';
import { analyzeImage, suggestSchedule, chatWithAI, estimateTaskDuration } from './services/geminiService';
import { PrintLayout } from './components/PrintLayout';
import { SettingsModal } from './components/SettingsModal';
import { useToast } from './components/Toast';
import { validateEventTitle, validateTaskTitle, validateImageFile } from './utils/validation';
import { Camera, Calendar as CalendarIcon, Printer, CheckSquare, Plus, Loader2, X, Clock, Layout, List, Edit2, Trash2, Wand2, Download, GripVertical, Users, Eye, EyeOff, Play, Pause, MessageSquare, Send, Sparkles, Moon, Sun, RotateCcw, Timer, ChevronLeft, ChevronRight, CalendarDays, Repeat, Settings } from 'lucide-react';
import { Platform, applySafeAreaVars } from './utils/platform';
import { takePicture, requestCameraPermissions, saveTextFile } from './utils/capacitorHelpers';
import { Directory } from '@capacitor/filesystem';

// Example initial data - users can clear this or add their own
const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Review project requirements', completed: false, actualTime: 0, isTimerRunning: false },
  { id: '2', title: 'Prepare presentation slides', completed: false, actualTime: 0, isTimerRunning: false },
  { id: '3', title: 'Schedule team meeting', completed: false, actualTime: 0, isTimerRunning: false },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Team Standup', dayOfWeek: 1, type: 'work', time: '09:00', calendarId: 'personal' },
  { id: '2', title: 'Project Review', dayOfWeek: 3, type: 'work', time: '14:00', calendarId: 'team' },
  { id: '3', title: 'Weekly Planning', dayOfWeek: 5, type: 'other', time: '10:00', calendarId: 'personal' },
];

const INITIAL_CALENDARS: CalendarConfig[] = [
  { id: 'personal', name: 'Personal', color: 'indigo', isVisible: true },
  { id: 'team', name: 'Team', color: 'teal', isVisible: true },
  { id: 'magic', name: 'Magic ✨', color: 'rose', isVisible: true },
];

const App: React.FC = () => {
  // --- Hooks ---
  const toast = useToast();

  // --- State ---
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [calendars, setCalendars] = useState<CalendarConfig[]>(INITIAL_CALENDARS);
  const [theme, setTheme] = useState<Theme>('light');
  
  // Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());

  // History for Undo
  const [eventsHistory, setEventsHistory] = useState<CalendarEvent[] | null>(null);

  // App State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DIGITAL);
  const [digitalView, setDigitalView] = useState<DigitalViewMode>(DigitalViewMode.MONTH);
  const [printSide, setPrintSide] = useState<'A' | 'B'>('A');
  
  // Assistant
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ id: '0', role: 'assistant', content: 'Hi! I can help you plan your tasks, estimate time, or add events to your calendar.' }]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(false);

  // Drag and Drop State
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Editing State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<CalendarEvent>>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [tempTaskTitle, setTempTaskTitle] = useState("");
  // Editing UI State
  const [isRecurring, setIsRecurring] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // --- Date Helpers ---
  const realToday = new Date();
  const isRealToday = (d: Date) => d.getDate() === realToday.getDate() && d.getMonth() === realToday.getMonth() && d.getFullYear() === realToday.getFullYear();
  
  // Formatters
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();
  const totalDays = getDaysInMonth(currentYear, currentDate.getMonth());

  // --- Effects ---

  // Initialize platform features
  useEffect(() => {
    // Apply safe area insets for iOS
    applySafeAreaVars();

    // Log platform info
    console.log('Platform:', Platform.getPlatform());
    console.log('Is Native:', Platform.isNative());
    console.log('Is Mobile:', Platform.isMobile());

    // Check if this is the first run
    const setupComplete = localStorage.getItem('ai_setup_complete');
    if (!setupComplete) {
      setIsFirstRun(true);
      setIsSettingsOpen(true);
    }
  }, []);

  // Persistence
  useEffect(() => {
    const savedTasks = localStorage.getItem('paper2plan_tasks');
    const savedEvents = localStorage.getItem('paper2plan_events');
    const savedCalendars = localStorage.getItem('paper2plan_calendars');
    const savedTheme = localStorage.getItem('paper2plan_theme');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedCalendars) setCalendars(JSON.parse(savedCalendars));
    if (savedTheme) setTheme(savedTheme as Theme);
  }, []);

  useEffect(() => {
    localStorage.setItem('paper2plan_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('paper2plan_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('paper2plan_calendars', JSON.stringify(calendars));
  }, [calendars]);

  useEffect(() => {
    localStorage.setItem('paper2plan_theme', theme);
    document.documentElement.className = theme === 'midnight' ? 'dark midnight' : theme;
    if (theme === 'dark' || theme === 'midnight') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
        setTasks(currentTasks => {
            const hasRunning = currentTasks.some(t => t.isTimerRunning);
            if (!hasRunning) return currentTasks;
            
            return currentTasks.map(t => {
                if (t.isTimerRunning) {
                    return { ...t, actualTime: (t.actualTime || 0) + 1 };
                }
                return t;
            });
        });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAssistantOpen]);

  // --- Logic Handlers ---

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const navigate = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      switch (digitalView) {
          case DigitalViewMode.MONTH:
              newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
              break;
          case DigitalViewMode.WEEK:
              newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
              break;
          case DigitalViewMode.DAY:
              newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
              break;
      }
      setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const toggleTaskTimer = (id: string) => {
      setTasks(tasks.map(t => t.id === id ? { ...t, isTimerRunning: !t.isTimerRunning } : t));
  };

  const getEventStyle = (calendarId: string) => {
      const cal = calendars.find(c => c.id === calendarId) || calendars[0];
      const color = cal.color;
      
      const styles: Record<string, string> = {
          indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-200',
          teal: 'bg-teal-50 border-teal-100 text-teal-700 hover:border-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:text-teal-200',
          rose: 'bg-rose-50 border-rose-100 text-rose-700 hover:border-rose-300 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-200',
          slate: 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300',
      };
      return styles[color] || styles.indigo;
  };

  const toggleCalendarVisibility = (id: string) => {
      setCalendars(calendars.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const data = await analyzeImage(base64String);

        const newTasks = data.tasks.map((t, i) => ({
          id: `new-${Date.now()}-${i}`,
          title: t,
          completed: false,
          actualTime: 0,
          isTimerRunning: false
        }));

        const newEvents = data.events.map((e, i) => ({
          id: `new-evt-${Date.now()}-${i}`,
          title: e.title,
          dayOfWeek: e.dayOfWeek,
          time: e.time,
          type: 'other' as const,
          calendarId: 'personal'
        }));

        setTasks(prev => [...prev, ...newTasks]);
        setEvents(prev => [...prev, ...newEvents]);

        toast.success(`Extracted ${newTasks.length} tasks and ${newEvents.length} events`);
      } catch (error) {
        console.error("Failed to analyze", error);
        toast.error(error instanceof Error ? error.message : "Failed to analyze image. Please ensure the backend server is running.");
      } finally {
        setIsAnalyzing(false);
        // Reset file input
        if (e.target) e.target.value = '';
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleNativeCamera = async () => {
    // Request camera permissions first on mobile
    if (Platform.isNative()) {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        toast.error("Camera permissions are required to scan notes.");
        return;
      }
    }

    setIsAnalyzing(true);
    try {
      // Try to use native camera first
      const base64Image = await takePicture({ source: 'prompt', quality: 90 });

      if (base64Image) {
        // Native camera was successful
        const data = await analyzeImage(base64Image);

        const newTasks = data.tasks.map((t, i) => ({
          id: `new-${Date.now()}-${i}`,
          title: t,
          completed: false,
          actualTime: 0,
          isTimerRunning: false
        }));

        const newEvents = data.events.map((e, i) => ({
          id: `new-evt-${Date.now()}-${i}`,
          title: e.title,
          dayOfWeek: e.dayOfWeek,
          time: e.time,
          type: 'other' as const,
          calendarId: 'personal'
        }));

        setTasks(prev => [...prev, ...newTasks]);
        setEvents(prev => [...prev, ...newEvents]);

        toast.success(`Extracted ${newTasks.length} tasks and ${newEvents.length} events`);
      } else {
        // Fall back to web file input
        fileInputRef.current?.click();
      }
    } catch (error) {
      console.error("Failed to capture or analyze image", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze image. Please try again.");
      setIsAnalyzing(false);
    } finally {
      if (!Platform.isNative()) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleMagicSchedule = async () => {
    const uncompletedTasks = tasks.filter(t => !t.completed);
    if (uncompletedTasks.length === 0) {
      toast.info("All tasks are completed! Nothing to schedule.");
      return;
    }

    setIsMagicLoading(true);
    // Snapshot for Undo
    setEventsHistory([...events]);

    try {
        const visibleEvents = events.filter(e => {
            const cal = calendars.find(c => c.id === e.calendarId);
            return cal && cal.isVisible;
        });

        // Ensure magic calendar exists
        if (!calendars.find(c => c.id === 'magic')) {
            setCalendars([...calendars, { id: 'magic', name: 'Magic ✨', color: 'rose', isVisible: true }]);
        }

        const suggestions = await suggestSchedule(tasks, visibleEvents, currentDate.toDateString());
        if (suggestions.length > 0) {
            setEvents(prev => [...prev, ...suggestions]);
            toast.success(`Added ${suggestions.length} scheduled task${suggestions.length > 1 ? 's' : ''} to your calendar`);
        } else {
            toast.warning("Could not find any suitable time slots. Try adjusting your schedule.");
            setEventsHistory(null); // Clear history if no suggestions
        }
    } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : "Failed to generate magic schedule. Please ensure the backend server is running.");
        setEventsHistory(null); // Clear history if failed
    } finally {
        setIsMagicLoading(false);
    }
  };

  const undoMagicSchedule = () => {
      if (eventsHistory) {
          setEvents(eventsHistory);
          setEventsHistory(null);
      }
  };

  const handleEstimateTask = async (task: Task) => {
      const duration = await estimateTaskDuration(task.title);
      setTasks(tasks.map(t => t.id === task.id ? { ...t, estimatedTime: duration } : t));
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput };
      setChatMessages([...chatMessages, newUserMsg]);
      setChatInput("");
      setIsChatLoading(true);

      try {
        const response = await chatWithAI([...chatMessages, newUserMsg], tasks, events, currentDate.toDateString());
        
        let assistantText = response.text;
        
        // Handle Function Calls (Tools)
        if (response.toolCalls && response.toolCalls.length > 0) {
            let addedCount = 0;
            response.toolCalls.forEach(call => {
                if (call.name === 'addCalendarEvent' && call.args) {
                    const args = call.args as any;
                    const newEvent: CalendarEvent = {
                        id: `ai-evt-${Date.now()}-${Math.random()}`,
                        title: args.title,
                        time: args.time || 'All Day',
                        type: args.type || 'work',
                        calendarId: 'personal',
                        dayOfWeek: args.dayOfWeek,
                        date: args.date
                    };
                    setEvents(prev => [...prev, newEvent]);
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                toast.success(`Added ${addedCount} event${addedCount > 1 ? 's' : ''} to calendar`);
            }

            if (addedCount > 0 && !assistantText) {
                assistantText = `I've added ${addedCount} event${addedCount > 1 ? 's' : ''} to your calendar.`;
            } else if (addedCount > 0) {
                assistantText += `\n\n(Added ${addedCount} event${addedCount > 1 ? 's' : ''} to calendar)`;
            }
        }

        if (!assistantText && (!response.toolCalls || response.toolCalls.length === 0)) {
            assistantText = "I processed your request.";
        }
        
        setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: assistantText }]);
      } catch (error) {
          console.error(error);
          const errorMsg = error instanceof Error ? error.message : "Sorry, I encountered an error. Please ensure the backend server is running.";
          setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: errorMsg }]);
          toast.error("AI assistant error");
      } finally {
          setIsChatLoading(false);
      }
  };

  const handleExportICS = async () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Paper2Plan//EN\n";
    const eventsToExport = events.filter(e => {
        const cal = calendars.find(c => c.id === e.calendarId);
        return cal && cal.isVisible;
    });

    eventsToExport.forEach(event => {
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:${event.title}\n`;
        let startIso = "";
        if (event.date) {
            startIso = event.date.replace(/-/g, '') + "T090000";
        } else if (event.dayOfWeek !== undefined) {
             const d = new Date(currentDate);
             // Logic: Find next occurrence of dayOfWeek
             d.setDate(d.getDate() + ((event.dayOfWeek + 7 - d.getDay()) % 7));
             const yyyy = d.getFullYear();
             const mm = String(d.getMonth() + 1).padStart(2, '0');
             const dd = String(d.getDate()).padStart(2, '0');
             startIso = `${yyyy}${mm}${dd}T090000`;
        }
        icsContent += `DTSTART:${startIso}\n`;
        icsContent += `DTEND:${startIso}\n`;
        icsContent += `DESCRIPTION:${event.type} event - ${event.time || ''}\n`;
        icsContent += "END:VEVENT\n";
    });
    icsContent += "END:VCALENDAR";

    // Try to save using native filesystem on mobile
    if (Platform.isNative()) {
      const fileName = `paper2plan_schedule_${Date.now()}.ics`;
      const saved = await saveTextFile(fileName, icsContent, Directory.Documents);
      if (saved) {
        alert(`Calendar exported successfully to Documents/${fileName}`);
        return;
      }
    }

    // Fall back to web download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'paper2plan_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => window.print();

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'copy';
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
  const handleDrop = (e: React.DragEvent, target: { dayOfWeek?: number, date?: string }) => {
    e.preventDefault();
    if (!draggedTask) return;
    const targetCalendar = calendars.find(c => c.isVisible) || calendars[0];
    const newEvent: CalendarEvent = {
        id: `drop-${Date.now()}`,
        title: draggedTask.title,
        type: 'work',
        time: 'TBD',
        dayOfWeek: target.dayOfWeek,
        date: target.date,
        calendarId: targetCalendar.id
    };
    setEvents([...events, newEvent]);
    setDraggedTask(null);
  };

  // --- CRUD Wrappers ---
  const toggleTaskCompletion = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTaskTitle(newTaskTitle);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid task title');
      return;
    }
    setTasks([...tasks, { id: `task-${Date.now()}`, title: newTaskTitle.trim(), completed: false, actualTime: 0, isTimerRunning: false }]);
    setNewTaskTitle("");
    toast.success('Task added');
  };
  const startEditingTask = (task: Task) => { setEditingTaskId(task.id); setTempTaskTitle(task.title); };
  const saveTaskEdit = () => {
    if (!editingTaskId) return;
    if (!tempTaskTitle.trim()) deleteTask(editingTaskId);
    else setTasks(tasks.map(t => t.id === editingTaskId ? { ...t, title: tempTaskTitle } : t));
    setEditingTaskId(null);
  };
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.info('Task deleted');
  };
  
  const openEventModal = (event?: CalendarEvent, dayOfWeek?: number, date?: string) => {
    if (event) {
        setCurrentEvent({ ...event });
        setIsRecurring(event.date === undefined && event.dayOfWeek !== undefined);
    } else {
        const defaultCalendar = calendars.find(c => c.isVisible) || calendars[0];
        setCurrentEvent({ id: `evt-${Date.now()}`, title: '', dayOfWeek: dayOfWeek, date: date, time: '', type: 'other', calendarId: defaultCalendar.id });
        setIsRecurring(date === undefined);
    }
    setIsEventModalOpen(true);
  };
  const saveEvent = () => {
    const validation = validateEventTitle(currentEvent.title || '');
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid event title');
      return;
    }

    // Normalize data based on recurrence toggle
    const finalEvent = { ...currentEvent } as CalendarEvent;
    if (isRecurring) {
        delete finalEvent.date;
        if (finalEvent.dayOfWeek === undefined) finalEvent.dayOfWeek = 0;
    } else {
        delete finalEvent.dayOfWeek;
        if (!finalEvent.date) finalEvent.date = new Date().toISOString().split('T')[0];
    }

    const isEdit = events.some(e => e.id === finalEvent.id);
    if (isEdit) {
      setEvents(events.map(e => e.id === finalEvent.id ? finalEvent : e));
      toast.success('Event updated');
    } else {
      setEvents([...events, finalEvent]);
      toast.success('Event added');
    }
    setIsEventModalOpen(false);
  };
  const deleteCurrentEvent = () => {
      if (currentEvent.id) {
        setEvents(events.filter(e => e.id !== currentEvent.id));
        toast.info('Event deleted');
      }
      setIsEventModalOpen(false);
  };

  const getVisibleEvents = () => events.filter(e => {
      const cal = calendars.find(c => c.id === e.calendarId);
      return cal && cal.isVisible;
  });

  // --- Renderers ---
  
  const renderDigitalMonth = () => {
    const visibleEvents = getVisibleEvents();
    return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {d}
            </div>
        ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="bg-slate-50/50 dark:bg-slate-950/50"></div>)}
        {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const dayOfWeek = (firstDayOfMonth + i) % 7;
            const dateStr = new Date(currentYear, currentDate.getMonth(), dayNum).toISOString().split('T')[0];
            const cellDate = new Date(currentYear, currentDate.getMonth(), dayNum);
            const isToday = isRealToday(cellDate);

            // Filter logic: Match exact date OR (match dayOfWeek AND has no specific date)
            const daysEvents = visibleEvents.filter(e => e.date === dateStr || (!e.date && e.dayOfWeek === dayOfWeek));

            return (
            <div 
                key={dayNum}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, { date: dateStr, dayOfWeek: dayOfWeek })} 
                className={`p-2 border-b border-slate-100 dark:border-slate-800 group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[100px] flex flex-col cursor-pointer relative ${draggedTask ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : ''}`}
                onClick={() => openEventModal(undefined, dayOfWeek, dateStr)}
            >
                <div className="flex justify-between items-start mb-2 pointer-events-none">
                    <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>{dayNum}</span>
                    <Plus className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1 overflow-y-auto custom-scrollbar">
                {daysEvents.map((ev, idx) => (
                    <div 
                        key={idx} 
                        onClick={(e) => { e.stopPropagation(); openEventModal(ev); }}
                        className={`text-[10px] p-1 rounded border flex justify-between items-start gap-1 group/event cursor-pointer hover:shadow-sm transition-all ${getEventStyle(ev.calendarId)}`}
                    >
                    <div className="truncate w-full pointer-events-none">
                        <span className="font-bold mr-1">{ev.time ? ev.time.split(' ')[0] : ''}</span>
                        {ev.title}
                    </div>
                    </div>
                ))}
                </div>
                {draggedTask && <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 pointer-events-none flex items-center justify-center text-indigo-700 font-bold text-xs">Drop to Add</div>}
            </div>
            );
        })}
        </div>
    </div>
  )};

  const renderDigitalWeek = () => {
    // Calculate start of week (Sunday) based on viewed date
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    return (
        <div className="grid grid-cols-7 h-full gap-2 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const dateStr = dayDate.toISOString().split('T')[0];
            const isToday = isRealToday(dayDate);
            const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = dayDate.getDate();

            const daysEvents = getVisibleEvents().filter(e => e.date === dateStr || (!e.date && e.dayOfWeek === i));

            return (
                <div 
                    key={dateStr} 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, { date: dateStr, dayOfWeek: i })}
                    className={`flex flex-col h-full rounded-xl border group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors ${isToday ? 'border-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                    onClick={() => openEventModal(undefined, i, dateStr)}
                >
                    <div className={`p-3 text-center border-b flex justify-between items-center ${isToday ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-100/50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'}`}>
                        <div className="w-4"></div>
                        <div>
                            <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{dayName}</div>
                            <div className={`text-lg font-bold leading-none mt-1 ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{dayNum}</div>
                        </div>
                        <Plus className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-indigo-600" />
                    </div>
                    <div className="flex-1 p-2 space-y-2 overflow-y-auto cursor-pointer relative custom-scrollbar">
                        {daysEvents.map((ev, idx) => (
                            <div 
                                    key={idx} 
                                    onClick={(e) => { e.stopPropagation(); openEventModal(ev); }}
                                    className={`p-2 rounded shadow-sm border text-xs hover:shadow-md transition-all cursor-pointer ${getEventStyle(ev.calendarId)}`}
                                >
                                <div className="font-bold mb-0.5 pointer-events-none">{ev.time || 'All Day'}</div>
                                <div className="pointer-events-none">{ev.title}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        })}
    </div>
    );
  };

  return (
    <div className={`flex flex-col h-full font-sans ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-950 text-slate-100'}`}>
      
      {/* Event Modal */}
      {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{currentEvent.id ? 'Edit Event' : 'New Event'}</h3>
                      <button onClick={() => setIsEventModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Event Title</label>
                          <input 
                            type="text" 
                            value={currentEvent.title || ''} 
                            onChange={e => setCurrentEvent({...currentEvent, title: e.target.value})}
                            placeholder="e.g. Meeting with Sarah"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            autoFocus
                          />
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                        <input 
                            type="checkbox" 
                            id="isRecurring"
                            checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="isRecurring" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer select-none">
                            <Repeat className="w-4 h-4" /> Repeat Weekly
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            {isRecurring ? (
                                <>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Day of Week</label>
                                    <select 
                                        value={currentEvent.dayOfWeek ?? 0} 
                                        onChange={e => setCurrentEvent({...currentEvent, dayOfWeek: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                                    >
                                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => (
                                            <option key={d} value={i}>{d}</option>
                                        ))}
                                    </select>
                                </>
                            ) : (
                                <>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Date</label>
                                    <input 
                                        type="date"
                                        value={currentEvent.date || new Date().toISOString().split('T')[0]}
                                        onChange={e => setCurrentEvent({...currentEvent, date: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                                    />
                                </>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Calendar</label>
                            <select 
                                value={currentEvent.calendarId} 
                                onChange={e => setCurrentEvent({...currentEvent, calendarId: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            >
                                {calendars.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Type</label>
                             <select 
                                value={currentEvent.type} 
                                onChange={e => setCurrentEvent({...currentEvent, type: e.target.value as any})}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                             >
                                 <option value="work">Work</option>
                                 <option value="personal">Personal</option>
                                 <option value="deadline">Deadline</option>
                                 <option value="other">Other</option>
                             </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Time</label>
                            <input 
                                type="text" 
                                value={currentEvent.time || ''} 
                                onChange={e => setCurrentEvent({...currentEvent, time: e.target.value})}
                                placeholder="e.g. 14:00"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            />
                          </div>
                      </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-3">
                      {currentEvent.id && (
                          <button 
                            onClick={deleteCurrentEvent}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                          >
                              <Trash2 className="w-4 h-4" /> Delete
                          </button>
                      )}
                      <div className="flex gap-3 ml-auto">
                        <button 
                            onClick={() => setIsEventModalOpen(false)}
                            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={saveEvent}
                            disabled={!currentEvent.title}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Event
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Navigation Bar */}
      <nav className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 print:hidden z-20 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
             <CalendarIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Paper2Plan</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setViewMode(ViewMode.DIGITAL)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === ViewMode.DIGITAL ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Layout className="w-4 h-4" /> Digital
            </button>
            <button 
              onClick={() => setViewMode(ViewMode.PRINT_PREVIEW)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === ViewMode.PRINT_PREVIEW ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" title="Toggle theme">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" title="AI Provider Settings">
              <Settings className="w-5 h-5" />
          </button>

          {eventsHistory && (
              <button 
                onClick={undoMagicSchedule}
                className="flex items-center gap-2 px-3 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 rounded-lg text-sm font-bold transition-colors"
                title="Undo last magic schedule"
              >
                  <RotateCcw className="w-4 h-4" /> Revert
              </button>
          )}

          <button 
            onClick={handleMagicSchedule}
            disabled={isMagicLoading}
            className="flex items-center gap-2 px-3 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            title="Auto-schedule tasks with AI"
          >
             {isMagicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
             <span className="hidden sm:inline">Magic Schedule</span>
          </button>

          <button 
            onClick={handleExportICS}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
            title="Export to Calendar (.ics)"
          >
             <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleNativeCamera}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-md hover:shadow-lg transform active:scale-95 duration-200"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>Scan Note</span>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        
        {viewMode === ViewMode.DIGITAL && (
          <div className="h-full flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar */}
            <aside className="w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
              
              {/* Calendars Section */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Calendars
                  </h2>
                  <div className="space-y-2">
                      {calendars.map(cal => (
                          <div 
                            key={cal.id} 
                            onClick={() => toggleCalendarVisibility(cal.id)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${cal.isVisible ? 'bg-slate-50 dark:bg-slate-800' : 'opacity-60 hover:opacity-80'}`}
                          >
                              <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${cal.color === 'indigo' ? 'bg-indigo-500' : cal.color === 'teal' ? 'bg-teal-500' : 'bg-rose-500'}`}></div>
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cal.name}</span>
                              </div>
                              <button className="text-slate-400">
                                  {cal.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

              {/* To-Do Section */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    To-Do List
                    </h2>
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full font-bold border border-indigo-100 dark:border-indigo-800">
                    {tasks.filter(t => !t.completed).length}
                    </span>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%`}}></div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20 custom-scrollbar">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    draggable={!task.completed}
                    onDragStart={(e) => handleDragStart(e, task)}
                    className={`group flex flex-col gap-2 p-3 rounded-xl border transition-all duration-200 
                        ${task.completed ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-70' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md cursor-grab active:cursor-grabbing'}`}
                  >
                    <div className="flex items-start gap-3">
                        {!task.completed && (
                            <div className="mt-1 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 cursor-grab">
                                <GripVertical className="w-4 h-4" />
                            </div>
                        )}

                        <button 
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}`}
                        >
                        {task.completed && <CheckSquare className="w-3.5 h-3.5" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                            {editingTaskId === task.id ? (
                                <input 
                                    type="text" 
                                    value={tempTaskTitle}
                                    onChange={(e) => setTempTaskTitle(e.target.value)}
                                    className="w-full text-sm border-b border-indigo-500 focus:outline-none bg-transparent dark:text-slate-100"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && saveTaskEdit()}
                                    onBlur={saveTaskEdit}
                                />
                            ) : (
                                <span 
                                    onClick={() => startEditingTask(task)}
                                    className={`text-sm font-medium leading-relaxed block cursor-text ${task.completed ? 'text-slate-400 dark:text-slate-500 line-through decoration-2' : 'text-slate-700 dark:text-slate-200'}`}
                                >
                                    {task.title}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {!task.completed && (
                        <div className="pl-8 flex items-center gap-3">
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 gap-2">
                                <button onClick={() => toggleTaskTimer(task.id)} className={`p-1 rounded-full ${task.isTimerRunning ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-600'}`}>
                                    {task.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                </button>
                                <span className={`text-xs font-mono font-medium ${task.isTimerRunning ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {formatTime(task.actualTime || 0)}
                                </span>
                            </div>

                            <button 
                                onClick={() => handleEstimateTask(task)}
                                className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-indigo-500 flex items-center gap-1"
                                title="Ask AI to estimate time"
                            >
                                <Sparkles className="w-3 h-3" />
                                {task.estimatedTime || 'Estimate'}
                            </button>
                        </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Task Input Area */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  <form onSubmit={addTask} className="relative">
                      <input 
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-medium dark:text-slate-100 dark:placeholder-slate-500"
                      />
                      <Plus className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                  </form>
              </div>
            </aside>

            {/* Main Digital View Container */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950">
                {/* Internal Digital Tabs */}
                <div className="px-8 pt-6 pb-2 flex items-center justify-between shrink-0">
                    <div className="flex items-baseline gap-4">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm mr-4">
                            <button onClick={() => navigate('prev')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={goToToday} className="px-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600">
                                Today
                            </button>
                            <button onClick={() => navigate('next')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 w-64 whitespace-nowrap">
                            {digitalView === DigitalViewMode.DAY 
                                ? currentDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })
                                : `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`
                            }
                        </h2>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex">
                        {[
                            { id: DigitalViewMode.MONTH, label: 'Month', icon: Layout },
                            { id: DigitalViewMode.WEEK, label: 'Week', icon: Clock },
                            { id: DigitalViewMode.DAY, label: 'Day', icon: List }
                        ].map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => setDigitalView(mode.id as DigitalViewMode)}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${digitalView === mode.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <mode.icon className="w-4 h-4" />
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 p-6 pt-2 overflow-hidden">
                    {digitalView === DigitalViewMode.MONTH && renderDigitalMonth()}
                    {digitalView === DigitalViewMode.WEEK && renderDigitalWeek()}
                    {digitalView === DigitalViewMode.DAY && (
                        <div className="h-full flex gap-6 overflow-hidden">
                            <div 
                                className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 overflow-y-auto flex flex-col items-center relative custom-scrollbar"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, { date: currentDate.toISOString().split('T')[0], dayOfWeek: currentDate.getDay() })}
                            >
                                <button 
                                    onClick={() => openEventModal(undefined, currentDate.getDay(), currentDate.toISOString().split('T')[0])}
                                    className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <Plus className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                                </button>
                                <div className="text-center mb-8">
                                    <h2 className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</h2>
                                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-2 font-medium">{currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className="w-full max-w-lg space-y-6 relative">
                                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                                    {getVisibleEvents()
                                        .filter(e => e.date === currentDate.toISOString().split('T')[0] || (!e.date && e.dayOfWeek === currentDate.getDay()))
                                        .map((ev, idx) => {
                                        const cal = calendars.find(c => c.id === ev.calendarId);
                                        return (
                                        <div key={idx} className="relative pl-16 group cursor-pointer" onClick={() => openEventModal(ev)}>
                                            <div className={`absolute left-[19px] top-1 w-3 h-3 rounded-full border-4 border-white dark:border-slate-900 shadow-sm z-10 ${cal?.color === 'indigo' ? 'bg-indigo-500' : cal?.color === 'teal' ? 'bg-teal-500' : 'bg-rose-500'}`}></div>
                                            <div className={`p-4 rounded-xl border group-hover:shadow-md transition-all ${getEventStyle(ev.calendarId)}`}>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-lg">{ev.title}</h4>
                                                    <span className="text-xs font-mono bg-white/50 dark:bg-black/20 px-2 py-1 rounded border border-black/5 dark:border-white/10">{ev.time || 'Anytime'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        )}

        {/* AI Assistant Chat Bubble */}
        <div className={`fixed bottom-6 right-6 z-40 transition-all ${viewMode === ViewMode.PRINT_PREVIEW ? 'hidden' : 'block'}`}>
            {isAssistantOpen ? (
                <div className="bg-white dark:bg-slate-900 w-80 md:w-96 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[600px] animate-in slide-in-from-bottom-5">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 rounded-t-2xl text-white">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            <h3 className="font-bold">Planner Assistant</h3>
                        </div>
                        <button onClick={() => setIsAssistantOpen(false)} className="p-1 hover:bg-white/20 rounded-full"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="p-4 h-80 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-950">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isChatLoading && <div className="flex justify-start"><div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm shadow-sm"><Loader2 className="w-4 h-4 animate-spin text-indigo-500" /></div></div>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleChatSubmit} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl flex gap-2">
                        <input 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask Gemini to plan..."
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                        />
                        <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAssistantOpen(true)}
                    className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            )}
        </div>

        {/* Print Preview Mode */}
        {viewMode === ViewMode.PRINT_PREVIEW && (
           <div className="h-full bg-slate-800 overflow-y-auto flex flex-col items-center py-8">
             <div className="mb-8 flex flex-col items-center gap-4 print:hidden sticky top-4 z-50">
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl max-w-lg w-full border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 text-lg">Print Settings</h3>
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button onClick={() => setPrintSide('A')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${printSide === 'A' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Side A</button>
                            <button onClick={() => setPrintSide('B')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${printSide === 'B' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Side B</button>
                        </div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-900 mb-4 border border-indigo-100">
                        {printSide === 'A' ? <p>Print this side first.</p> : <p>Flip paper on <strong className="uppercase">Long Edge</strong> and print this side.</p>}
                    </div>
                    <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-lg font-bold transition-all"><Printer className="w-5 h-5" /> Print Page {printSide}</button>
                </div>
             </div>
             <div className="print:absolute print:top-0 print:left-0 print:w-full print:h-full print:m-0 origin-top transform scale-[0.4] md:scale-[0.6] lg:scale-[0.75] xl:scale-90 transition-transform shadow-2xl">
                <PrintLayout events={getVisibleEvents()} tasks={tasks} monthName={currentMonthName} side={printSide} />
             </div>
           </div>
        )}

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isFirstRun={isFirstRun}
      />
    </div>
  );
};

export default App;