
export interface User {
  _id: string;
  email: string;
  name: string;
  token?: string; // Token is received on login
  createdAt?: string; // Added from backend timestamps
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
  options?: string[]; // array of meanings or hanzi for multiple choice
  correctAnswer: string; // the correct meaning, pinyin, or hanzi
  userAnswer?: string;
}

export interface QuizResultType {
    score: number;
    total: number;
    questions: QuizQuestion[];
}

// --- New User Stats Type ---
export interface UserStats {
    mastery: {
        new: number;
        learning: number;
        known: number;
        mastered: number;
        total: number;
    };
    reviewForecast: {
        date: string; // "YYYY-MM-DD"
        count: number;
    }[]; // 7 days
    setsForReview: {
        setId: string;
        setTitle: string;
        dueCount: number;
    }[];
}

// --- New Leaderboard User Type ---
export interface LeaderboardUser {
  _id: string;
  name: string;
  xp: number;
  createdAt: string;
}


export interface AppState {
  user: User | null;
  vocabSets: VocabSet[];
  setsPagination: {
    currentPage: number;
    totalPages: number;
    totalSets: number;
    limit: number;
  } | null;
  publicSets: VocabSet[];
  publicSetsPagination: {
    currentPage: number;
    totalPages: number;
    totalSets: number;
    limit: number;
  } | null;
  quizHistory: QuizHistory[];
  profileQuizHistory: QuizHistory[] | null;
  userStats: UserStats | null;
  leaderboard: LeaderboardUser[] | null;
  isLoading: boolean;
  isRequestingUserApiKey: boolean; // To show the API key modal
}

export type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SETS_LOADED'; payload: { sets: VocabSet[]; page: number; pages: number; total: number; } }
  | { type: 'UPDATE_SET'; payload: VocabSet }
  | { type: 'HISTORY_LOADED'; payload: QuizHistory[] }
  | { type: 'PROFILE_HISTORY_LOADED'; payload: QuizHistory[] }
  | { type: 'PUBLIC_SETS_LOADED'; payload: { sets: VocabSet[]; page: number; pages: number; total: number; } }
  | { type: 'USER_STATS_LOADED'; payload: UserStats }
  | { type: 'LEADERBOARD_LOADED'; payload: LeaderboardUser[] }
  | { type: 'REQUEST_USER_API_KEY'; payload: boolean }; // Action for the modal