import React, { createContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { AppState, Action, User, VocabSet, View } from '../types';
import * as api from '../services/api';

const initialState: AppState = {
  user: null,
  vocabSets: [],
  currentView: { view: 'DASHBOARD' },
  isLoading: false,
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoading: false }; // Ensure loading is false on login
    case 'LOGOUT':
      return { ...initialState };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SETS_LOADED':
      return { ...state, vocabSets: action.payload };
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
    default:
      return state;
  }
};

interface AppContextType {
    state: AppState;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    setView: (view: View) => void;
    fetchSets: () => Promise<void>;
    saveSet: (set: Omit<VocabSet, '_id' | 'user'> & { _id?: string }) => Promise<void>;
    deleteSet: (setId: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
        const storedUser = localStorage.getItem('hanziflow_user');
        if (storedUser) {
            try {
                const user: User = JSON.parse(storedUser);
                return { ...initial, user };
            } catch {
                localStorage.removeItem('hanziflow_user');
                return initial;
            }
        }
        return initial;
    });

    const setView = (view: View) => {
        dispatch({ type: 'SET_VIEW', payload: view });
    };

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

    const fetchSets = useCallback(async () => {
        if (!state.user?.token) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const sets = await api.getSets();
            dispatch({ type: 'SETS_LOADED', payload: sets });
        } catch (error) {
            console.error("Failed to fetch sets:", error);
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.user?.token]);


    const saveSet = async (set: Omit<VocabSet, '_id' | 'user'> & { _id?: string }) => {
        if (!state.user) throw new Error("User not logged in");
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const savedSet = await api.saveSet(set);
            if(set._id) {
                dispatch({ type: 'UPDATE_SET', payload: savedSet });
            } else {
                dispatch({ type: 'ADD_SET', payload: savedSet });
            }
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

    useEffect(() => {
        if (state.user) {
            fetchSets();
        }
    }, [fetchSets, state.user]);


  return (
    <AppContext.Provider value={{ state, login, register, logout, setView, fetchSets, saveSet, deleteSet }}>
      {children}
    </AppContext.Provider>
  );
};