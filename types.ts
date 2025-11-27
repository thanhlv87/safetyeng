export interface Vocab {
  term: string;
  meaning: string;
  example: string;
  ipa?: string;
  vietnamese?: string; // Vietnamese translation
}

export interface DialogueLine {
  speaker: string;
  role: 'Engineer' | 'Safety Officer' | 'Worker' | 'Manager' | 'Examiner' | 'Trainee' | 'You';
  text: string;
  vietnamese?: string; // Vietnamese translation
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
}

export interface LessonScenario {
  title: string;
  description: string;
  dangerLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  imgPlaceholder?: string;
}

export interface DailyLesson {
  id: number; // 1 to 60
  topic: string;
  isReviewDay: boolean;
  vocab: Vocab[];
  dialogue: DialogueLine[];
  scenario: LessonScenario;
  quiz: QuizQuestion[];
}

export interface UserProgress {
  isLoggedIn: boolean;
  currentDay: number; // The day the user is currently allowed to access
  completedDays: number[];
  quizScores: Record<number, number>; // Day ID -> Score
  name: string;
  email: string;
  jobTitle?: string;
  company?: string;
  photoURL?: string; // For Gmail profile pic simulation
  streak: number;
  lastLoginDate: string;
}

export enum Tab {
  HOME = 'HOME',
  LESSON = 'LESSON',
  DICTIONARY = 'DICTIONARY',
  TEST = 'TEST',
  PROFILE = 'PROFILE'
}