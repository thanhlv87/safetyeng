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
  vietnamese?: string; // Vietnamese translation
  titleVietnamese?: string; // Vietnamese title
}

export interface TopicCategory {
  id: string;
  name: string;
  nameVietnamese: string;
  icon: string;
  color: string;
  description: string;
}

export interface DailyLesson {
  id: number; // 1 to 60
  topicId: string; // Topic category ID
  topic: string; // Topic title for display
  isReviewDay: boolean;
  vocab: Vocab[];
  dialogue: DialogueLine[];
  scenario: LessonScenario;
  quiz: QuizQuestion[];
}

// Progress tracking for a single topic (each topic has 60 days)
export interface TopicProgress {
  currentDay: number; // The day the user is currently allowed to access (1-60)
  completedDays: number[]; // List of completed day numbers
  quizScores: Record<number, number>; // Day ID -> Score percentage
}

export interface UserProgress {
  isLoggedIn: boolean;
  name: string;
  email: string;
  jobTitle?: string;
  company?: string;
  photoURL?: string; // For Gmail profile pic simulation
  streak: number;
  lastLoginDate: string;
  topics: Record<string, TopicProgress>; // topicId -> progress for that topic
}

export enum Tab {
  HOME = 'HOME',
  LESSON = 'LESSON',
  DICTIONARY = 'DICTIONARY',
  TEST = 'TEST',
  PROFILE = 'PROFILE'
}