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
}

export interface VocabSet {
  _id: string;
  user: string; // User ID from backend
  title: string;
  description: string;
  items: VocabItem[];
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
  | { view: 'QUIZ'; setId: string }
  | { view: 'QUIZ_RESULT'; setId: string; result: QuizResultType };

export interface AppState {
  user: User | null;
  vocabSets: VocabSet[];
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
  | { type: 'DELETE_SET'; payload: string }; // by setId (_id)