
import React, { createContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { AppState, Action, User, VocabSet, QuizHistory, QuizResultType, VocabItem } from '../types';
import * as api from '../services/api';
import * as geminiService from '../services/geminiService';

const initialState: AppState = {
    user: null,
    vocabSets: [],
    publicSets: [],
    quizHistory: [], // Initialize quiz history
    isLoading: false,
    currentView: {
        view: 'DASHBOARD'
    }
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...initialState };
    case 'UPDATE_USER':
      if (!state.user) return state; // Should not happen if logged in
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SETS_LOADED':
      return { ...state, vocabSets: action.payload };
    case 'PUBLIC_SETS_LOADED':
      return { ...state, publicSets: action.payload, isLoading: false };
    case 'ADD_SET':
      return { ...state, vocabSets: [...state.vocabSets, action.payload] };
    case 'UPDATE_SET':
      return {
        ...state,
        vocabSets: state.vocabSets.map(set =>
          set._id === action.payload._id ? action.payload : set
        ),
      };
    case 'DELETE_SET':
      return {
        ...state,
        vocabSets: state.vocabSets.filter(set => set._id !== action.payload),
      };
    case 'HISTORY_LOADED':
        return { ...state, quizHistory: action.payload };
    case 'ADD_HISTORY_ITEM':
        // Add to the top of the list and keep the list at a reasonable size
        const updatedHistory = [action.payload, ...state.quizHistory].slice(0, 20);
        return { ...state, quizHistory: updatedHistory };
    default:
      return state;
  }
};

interface AppContextType {
    state: AppState;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchSets: () => Promise<void>;
    saveSet: (set: Partial<Omit<VocabSet, '_id' | 'user'>> & { _id?: string }) => Promise<VocabSet | undefined>;
    deleteSet: (setId: string) => Promise<void>;
    saveQuizResult: (setId: string, result: QuizResultType) => Promise<void>;
    toggleNeedsReview: (setId: string, itemId: string) => Promise<void>;
    generateSetWithAI: (topic: string, count: number) => Promise<VocabItem[] | null>;
    fetchPublicSets: () => Promise<void>;
    cloneSet: (setId: string) => Promise<VocabSet | undefined>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialState = (): AppState => {
    const storedUser = localStorage.getItem('hanziflow_user');
    let user: User | null = null;
    if (storedUser) {
        try {
            user = JSON.parse(storedUser);
        } catch {
            localStorage.removeItem('hanziflow_user');
        }
    }
    return { ...initialState, user };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, getInitialState());

    const login = async (email: string, password: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const userWithToken = await api.loginUser(email, password);
            localStorage.setItem('hanziflow_user', JSON.stringify(userWithToken));
            dispatch({ type: 'LOGIN', payload: userWithToken });
        } catch (error) {
            console.error(error);
            alert((error as Error).message || "Login failed. Please check your credentials.");
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const register = async (name: string, email: string, password: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const userWithToken = await api.registerUser(name, email, password);
            localStorage.setItem('hanziflow_user', JSON.stringify(userWithToken));
            dispatch({ type: 'LOGIN', payload: userWithToken });
        } catch (error) {
            console.error(error);
            alert((error as Error).message || "Registration failed. Please try again.");
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const logout = () => {
        localStorage.removeItem('hanziflow_user');
        dispatch({ type: 'LOGOUT' });
    };
    
    const fetchInitialData = useCallback(async () => {
        if (!state.user?.token) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const [sets, history] = await Promise.all([
                api.getSets(),
                api.getQuizHistory()
            ]);
            dispatch({ type: 'SETS_LOADED', payload: sets });
            dispatch({ type: 'HISTORY_LOADED', payload: history });
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.user?.token]);


    const saveSet = async (set: Partial<Omit<VocabSet, '_id' | 'user'>> & { _id?: string }): Promise<VocabSet | undefined> => {
        if (!state.user) throw new Error("User not logged in");
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const savedSet = await api.saveSet(set);
            if(set._id) {
                dispatch({ type: 'UPDATE_SET', payload: savedSet });
            } else {
                dispatch({ type: 'ADD_SET', payload: savedSet });
            }
            return savedSet;
        } catch(error) {
            console.error("Failed to save set:", error);
            alert((error as Error).message);
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    
    const deleteSet = async (setId: string) => {
        if (!state.user) throw new Error("User not logged in");
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await api.deleteSet(setId);
            dispatch({ type: 'DELETE_SET', payload: setId });
        } catch(error) {
            console.error("Failed to delete set:", error);
            alert((error as Error).message);
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const saveQuizResult = async (setId: string, result: QuizResultType) => {
        if (!state.user) return;
        try {
            const { newHistoryItem, updatedUser, updatedSet } = await api.saveQuizResult(setId, result);
            
            dispatch({ type: 'ADD_HISTORY_ITEM', payload: newHistoryItem });
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            if (updatedSet) {
              dispatch({ type: 'UPDATE_SET', payload: updatedSet });
            }

            const storedUser = localStorage.getItem('hanziflow_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const updatedStoredUser = { ...user, ...updatedUser };
                localStorage.setItem('hanziflow_user', JSON.stringify(updatedStoredUser));
            }

        } catch (error) {
            console.error("Failed to save quiz result:", error);
        }
    };
    
    const toggleNeedsReview = async (setId: string, itemId: string) => {
        if (!state.user) return;
        const targetSet = state.vocabSets.find(s => s._id === setId);
        if (!targetSet) return;

        let foundItem: VocabItem | undefined;
        const updatedItems = targetSet.items.map(item => {
            if (item.id === itemId) {
                foundItem = { ...item, needsReview: !item.needsReview };
                return foundItem;
            }
            return item;
        });

        if (!foundItem) return;

        const setToSave = { ...targetSet, items: updatedItems };

        try {
            dispatch({ type: 'UPDATE_SET', payload: setToSave }); // Optimistic update
            await api.saveSet(setToSave);
        } catch (error) {
            console.error("Failed to update 'needs review' status:", error);
            dispatch({ type: 'UPDATE_SET', payload: targetSet }); 
            alert("Could not update item. Please try again.");
        }
    };
    
    const generateSetWithAI = async (topic: string, count: number): Promise<VocabItem[] | null> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const words = await geminiService.generateVocabSet(topic, count);
            if (words) {
                return words.map((word: any, index: number) => ({
                    ...word,
                    id: `ai-${Date.now()}-${index}`,
                }));
            }
            return null;
        } catch (error) {
            console.error("AI set generation failed:", error);
            // Alert is handled in the service
            return null;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const fetchPublicSets = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const publicSets = await api.getPublicSets();
            dispatch({ type: 'PUBLIC_SETS_LOADED', payload: publicSets });
        } catch (error) {
            console.error("Failed to fetch public sets:", error);
            alert((error as Error).message);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const cloneSet = async (setId: string): Promise<VocabSet | undefined> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const { newSet, updatedUser } = await api.cloneSet(setId);
            dispatch({ type: 'ADD_SET', payload: newSet });
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });

            const storedUser = localStorage.getItem('hanziflow_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const updatedStoredUser = { ...user, ...updatedUser };
                localStorage.setItem('hanziflow_user', JSON.stringify(updatedStoredUser));
            }
            
            alert(`Set "${newSet.title}" has been added to your collection!`);
            return newSet;
        } catch (error) {
            console.error("Failed to clone set:", error);
            alert((error as Error).message);
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    useEffect(() => {
        if (state.user) {
            fetchInitialData();
        }
    }, [fetchInitialData, state.user]);


  return (
    <AppContext.Provider value={{ state, login, register, logout, fetchSets: fetchInitialData, saveSet, deleteSet, saveQuizResult, toggleNeedsReview, generateSetWithAI, fetchPublicSets, cloneSet }}>
      {children}
    </AppContext.Provider>
  );
};