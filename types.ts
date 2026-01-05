

export enum RoutineType {
  MORNING_PRODUCTIVE = 'Mañana Productive',
  AFTERNOON_FOCUS = 'Tarde de Foco',
  SPLIT_SHIFT = 'Jornada Partida',
  CUSTOM = 'Personalizada',
  PDF_IMPORTED = 'Agenda Personal (Importada PDF)',
  EL_CAMBIO = 'El Cambio',
  WEEKEND_RECHARGE = 'Weekend Recharge'
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TimeBlock {
  id: string;
  time: string;
  activity: string;
  type: 'work' | 'sacred' | 'personal' | 'break';
  customColor?: string;
  location?: string;
  audioUrl?: string;
  aiSuggestion?: string;
  alarmEnabled?: boolean;
  enforceLock?: boolean;
  subtasks?: Subtask[];
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  blocks: TimeBlock[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  timestamp: number;
}

export enum ModelType {
  FLASH_LITE = 'fast',
  PRO = 'smart',
  THINKING = 'deep',
}

export interface DailyStats {
  date: string;
  focusMinutes: number;
  mood: number;
  didCloseOnTime: boolean;
  candelabroStreak?: number;
}

export type GoalPeriod = 'diario' | 'semanal' | 'mensual' | 'anual';

export interface Goal {
  id: string;
  text: string;
  period: GoalPeriod;
  completed: boolean;
  category?: string;
}

export interface DailyEvaluation {
  date: string;
  rating: number;
  planCompletion: 'yes' | 'partial' | 'no';
  moodEmoji: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  energyLevel: number;
  audioNote?: string;
  textNote?: string;
  interactionScore: number;
}

export interface AppSettings {
  vitaminDTime: string;
  vitaminDEnabled: boolean;
  theme?: 'light' | 'dark';
  accentColor?: 'teal' | 'indigo' | 'rose' | 'amber';
  appVolume?: number;
  customAlarmUrl?: string;
  userAvatar?: string;
  mentorAvatar?: string;
  lastInteractionTimestamp?: number;
  // NEW: Smart Notifications Settings
  notificationLeadTime: number; // minutes before (2, 5, 10)
  enableSmartNudges: boolean; // offer to shift schedule if late
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  targetMuscle: string;
  exercises: Exercise[];
}

// Added missing interface used in AgileCoach.tsx
export interface RetroEntry {
  date: string;
  wentWell: string;
  toImprove: string;
  actionItem: string;
}
