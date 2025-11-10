export interface User {
  _id: string;
  email: string;
  name: string;
  token?: string; // Token is received on login
}

export interface VocabItem {
  id: string; // Frontend-generated ID is fine for items within a set
  hanzi: string;
  pinyin: string;
  meaning: string;
  exampleSentence?: string;
  _id?: string; // Mongoose might add an _id to subdocuments
  needsReview?: boolean;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface VocabSet {
  _id: string;
  user: string; // User ID from backend
  title: string;
  description: string;
  items: VocabItem[];
  difficulty: Difficulty;
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

export type View = 
  | { view: 'DASHBOARD' }
  | { view: 'FLASHCARDS'; setId: string }
  | { view: 'QUIZ'; setId: string; quizType: 'standard' | 'review'; questionTypes?: QuestionType[] }
  | { view: 'QUIZ_RESULT'; setId: string; result: QuizResultType; quizType: 'standard' | 'review'; questionTypes?: QuestionType[] }
  | { view: 'PROGRESS'; setId: string };

export interface AppState {
  user: User | null;
  vocabSets: VocabSet[];
  quizHistory: QuizHistory[]; // Added quiz history
  currentView: View;
  isLoading: boolean;
}

export type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SETS_LOADED'; payload: VocabSet[] }
  | { type: 'ADD_SET'; payload: VocabSet }
  | { type: 'UPDATE_SET'; payload: VocabSet }
  | { type: 'DELETE_SET'; payload: string } // by setId (_id)
  | { type: 'HISTORY_LOADED'; payload: QuizHistory[] }
  | { type: 'ADD_HISTORY_ITEM'; payload: QuizHistory };