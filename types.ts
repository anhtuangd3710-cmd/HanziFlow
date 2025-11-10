
export interface User {
  _id: string;
  email: string;
  name: string;
  token?: string; // Token is received on login
  // --- Gamification Fields ---
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastStudiedDate?: string;
  // --- Community Fields ---
  clonedSets?: string[]; // Array of original set IDs
}

export interface VocabItem {
  id: string; // Frontend-generated ID is fine for items within a set
  hanzi: string;
  pinyin: string;
  meaning: string;
  exampleSentence?: string;
  _id?: string; // Mongoose might add an _id to subdocuments
  needsReview?: boolean;
  // --- SRS Fields ---
  srsLevel?: number;
  nextReviewDate?: string; // ISO date string
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface VocabSet {
  _id: string;
  user: string; // User ID from backend
  title: string;
  description: string;
  items: VocabItem[];
  difficulty: Difficulty;
  // --- Community Fields ---
  isPublic?: boolean;
  creatorName?: string;
  cloneCount?: number;
  publishedAt?: string;
  originalSetId?: string; // If this set is a clone
}

// --- New Quiz History Type ---
export interface QuizHistory {
    _id: string;
    user: string;
    vocabSet: Pick<VocabSet, '_id' | 'title'>; // Embed set info
    score: number;
    total: number;
    createdAt: string; // ISO date string
}


export type QuestionType = 
  | 'meaning' // Given Hanzi, choose Meaning
  | 'pinyin'  // Given Hanzi, type Pinyin
  | 'hanzi';  // Given Meaning, choose Hanzi

export interface QuizQuestion {
  type: QuestionType;
  vocabItem: VocabItem;
  options: string[]; // array of meanings or hanzi for multiple choice
  correctAnswer: string; // the correct meaning, pinyin, or hanzi
  userAnswer?: string;
}

export interface QuizResultType {
    score: number;
    total: number;
    questions: QuizQuestion[];
}

export interface AppState {
  user: User | null;
  vocabSets: VocabSet[];
  publicSets: VocabSet[]; // For community page
  quizHistory: QuizHistory[];
  isLoading: boolean;
  isRequestingUserApiKey: boolean; // To show the API key modal
}

export type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SETS_LOADED'; payload: VocabSet[] }
  | { type: 'ADD_SET'; payload: VocabSet }
  | { type: 'UPDATE_SET'; payload: VocabSet }
  | { type: 'DELETE_SET'; payload: string } // by setId (_id)
  | { type: 'HISTORY_LOADED'; payload: QuizHistory[] }
  | { type: 'ADD_HISTORY_ITEM'; payload: QuizHistory }
  | { type: 'PUBLIC_SETS_LOADED'; payload: VocabSet[] }
  | { type: 'REQUEST_USER_API_KEY'; payload: boolean }; // Action for the modal
