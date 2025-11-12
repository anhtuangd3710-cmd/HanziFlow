import React, { createContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { AppState, Action, User, VocabSet, QuizHistory, QuizResultType, VocabItem, UserStats, LeaderboardUser, AdminStats, AdminUser } from '../types';
import * as api from '../services/api';
import { AuthError } from '../services/api'; // Import the custom error type
import * as geminiService from '../services/geminiService';

const initialState: AppState = {
  user: null,
  vocabSets: [],
  setsPagination: null,
  publicSets: [],
  publicSetsPagination: null,
  quizHistory: [],
  profileQuizHistory: null,
  userStats: null,
  leaderboard: null,
  isLoading: false,
  isRequestingUserApiKey: false,
  adminStats: null,
  adminUsers: null,
  adminUsersPagination: null,
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...initialState };
    case 'UPDATE_USER':
      if (!state.user) return state;
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SETS_LOADED':
      return { 
          ...state, 
          vocabSets: action.payload.sets,
          setsPagination: {
              currentPage: action.payload.page,
              totalPages: action.payload.pages,
              totalSets: action.payload.total,
              limit: 6 // This should match the backend limit
          }
      };
    case 'PUBLIC_SETS_LOADED':
      return { 
        ...state, 
        publicSets: action.payload.sets,
        publicSetsPagination: {
          currentPage: action.payload.page,
          totalPages: action.payload.pages,
          totalSets: action.payload.total,
          limit: 9 // This should match the backend limit
        },
        isLoading: false 
      };
    case 'UPDATE_SET':
      return {
        ...state,
        vocabSets: state.vocabSets.map(set =>
          set._id === action.payload._id ? action.payload : set
        ),
      };
    case 'HISTORY_LOADED':
        return { ...state, quizHistory: action.payload };
    case 'PROFILE_HISTORY_LOADED':
        return { ...state, profileQuizHistory: action.payload, isLoading: false };
    case 'USER_STATS_LOADED':
        return { ...state, userStats: action.payload };
    case 'LEADERBOARD_LOADED':
        return { ...state, leaderboard: action.payload, isLoading: false };
    case 'REQUEST_USER_API_KEY':
        return { ...state, isRequestingUserApiKey: action.payload };
    case 'ADMIN_STATS_LOADED':
        return { ...state, adminStats: action.payload, isLoading: false };
    case 'ADMIN_USERS_LOADED':
        return {
            ...state,
            adminUsers: action.payload.users,
            adminUsersPagination: {
                currentPage: action.payload.page,
                totalPages: action.payload.pages,
            },
            isLoading: false,
        };
    default:
      return state;
  }
};

interface AppContextType {
    state: AppState;
    login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchSets: (page: number) => Promise<void>;
    saveSet: (set: Partial<Omit<VocabSet, '_id' | 'user'>> & { _id?: string }) => Promise<VocabSet | undefined>;
    deleteSet: (setId: string) => Promise<void>;
    saveQuizResult: (setId: string, result: QuizResultType) => Promise<void>;
    toggleNeedsReview: (setId: string, itemId: string) => Promise<void>;
    generateSetWithAI: (topic: string, count: number) => Promise<VocabItem[] | null>;
    generateExample: (word: { hanzi: string; pinyin: string; meaning: string; }) => Promise<string | null>;
    fetchPublicSets: (page: number, searchTerm?: string) => Promise<void>;
    cloneSet: (setId: string) => Promise<VocabSet | undefined>;
    closeApiKeyModal: () => void;
    fetchProfileHistory: () => Promise<void>;
    updateUserProfile: (userData: { name: string }) => Promise<void>;
    fetchLeaderboard: () => Promise<void>;
    // --- Admin Functions ---
    fetchAdminStats: () => Promise<void>;
    fetchAdminUsers: (page: number) => Promise<void>;
    adminDeleteUser: (userId: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'hanziflow_user';

const getInitialState = (): AppState => {
    const storedUser = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    let user: User | null = null;
    if (storedUser) {
        try {
            user = JSON.parse(storedUser);
        } catch {
            localStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }
    return { ...initialState, user };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, getInitialState());

    const closeApiKeyModal = () => dispatch({ type: 'REQUEST_USER_API_KEY', payload: false });

    const login = async (email: string, password: string, rememberMe: boolean) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const userWithToken = await api.loginUser(email, password);
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem(STORAGE_KEY, JSON.stringify(userWithToken));
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
            // Default to session storage on register, user can re-login with "remember me"
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userWithToken));
            dispatch({ type: 'LOGIN', payload: userWithToken });
        } catch (error) {
            console.error(error);
            alert((error as Error).message || "Registration failed. Please try again.");
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        dispatch({ type: 'LOGOUT' });
    }, []);

    const fetchSets = useCallback(async (page: number) => {
        if (!state.user?.token) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const data = await api.getSets(page, 6);
            dispatch({ type: 'SETS_LOADED', payload: data });
        } catch(error) {
            console.error("Failed to fetch sets:", error);
            if (error instanceof AuthError) {
                alert(error.message);
                logout();
            }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.user?.token, logout]);
    
    const fetchInitialData = useCallback(async () => {
        if (!state.user?.token) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            // Fetch sets, history, and global stats concurrently
            const [, history, stats] = await Promise.all([
                fetchSets(1),
                api.getQuizHistory(20), // Limit dashboard history
                api.getUserStats()
            ]);
            dispatch({ type: 'HISTORY_LOADED', payload: history });
            dispatch({ type: 'USER_STATS_LOADED', payload: stats });
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            if (error instanceof AuthError) {
                alert(error.message);
                logout();
            }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.user?.token, logout, fetchSets]);


    const saveSet = async (set: Partial<Omit<VocabSet, '_id' | 'user'>> & { _id?: string }): Promise<VocabSet | undefined> => {
        if (!state.user) throw new Error("User not logged in");
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const savedSet = await api.saveSet(set);
            if(set._id) { // This was an update
                dispatch({ type: 'UPDATE_SET', payload: savedSet });
            } else { // This was a creation, refetch the first page
                await fetchSets(1);
            }
            // Refetch stats after saving a set as it can change mastery totals
            const stats = await api.getUserStats();
            dispatch({ type: 'USER_STATS_LOADED', payload: stats });
            return savedSet;
        } catch(error) {
            console.error("Failed to save set:", error);
            if (error instanceof AuthError) {
                alert(error.message);
                logout();
            } else {
                alert((error as Error).message);
            }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    
    const deleteSet = async (setId: string) => {
        if (!state.user) throw new Error("User not logged in");
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await api.deleteSet(setId);
            // After deletion, refetch the current page.
            // If it was the last item on a page > 1, fetch the previous page.
            const { vocabSets, setsPagination } = state;
            let pageToFetch = setsPagination?.currentPage || 1;
            if (vocabSets.length === 1 && pageToFetch > 1) {
                pageToFetch -= 1;
            }
            await fetchSets(pageToFetch);
            // Also refetch stats
            const stats = await api.getUserStats();
            dispatch({ type: 'USER_STATS_LOADED', payload: stats });

        } catch(error) {
            console.error("Failed to delete set:", error);
            if (error instanceof AuthError) {
                alert(error.message);
                logout();
            } else {
                alert((error as Error).message);
            }
            // fetchSets will handle the final loading state
        }
    };

    const saveQuizResult = async (setId: string, result: QuizResultType) => {
        if (!state.user) return;
        try {
            const { updatedUser, updatedSet } = await api.saveQuizResult(setId, result);
            
            // Refetch history to ensure consistency and prevent duplicates
            const freshHistory = await api.getQuizHistory(20);
            dispatch({ type: 'HISTORY_LOADED', payload: freshHistory });

            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            if (updatedSet) {
              dispatch({ type: 'UPDATE_SET', payload: updatedSet });
            }
            
            // Refetch stats after a quiz to show immediate progress
            const stats = await api.getUserStats();
            dispatch({ type: 'USER_STATS_LOADED', payload: stats });

            const storedUser = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
            if (storedUser) {
                const storage = localStorage.getItem(STORAGE_KEY) ? localStorage : sessionStorage;
                const user = JSON.parse(storedUser);
                const updatedStoredUser = { ...user, ...updatedUser };
                storage.setItem(STORAGE_KEY, JSON.stringify(updatedStoredUser));
            }

        } catch (error) {
            console.error("Failed to save quiz result:", error);
            if (error instanceof AuthError) {
                alert(error.message);
                logout();
            }
        }
    };
    
    const toggleNeedsReview = async (setId: string, itemId: string) => {
        if (!state.user) return;
        const targetSet = state.vocabSets.find(s => s._id === setId);
        if (!targetSet) return;

        let foundItem: VocabItem | undefined;
        const updatedItems = targetSet.items.map(item => {
            if (item.id === itemId) {
                // Fix: Ensure needsReview is treated as a boolean even if undefined
                foundItem = { ...item, needsReview: !(item.needsReview || false) };
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
            if (error instanceof AuthError) {
                alert(error.message);
                logout();
            } else {
                alert("Could not update item. Please try again.");
            }
        }
    };

    const generateExample = async (word: { hanzi: string, pinyin: string, meaning: string }): Promise<string | null> => {
        try {
            return await geminiService.generateExampleSentence(word);
        } catch (error) {
            if (error instanceof Error && error.message === geminiService.API_KEY_FAILURE) {
                dispatch({ type: 'REQUEST_USER_API_KEY', payload: true });
            }
            return null;
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
            if (error instanceof Error && error.message === geminiService.API_KEY_FAILURE) {
                dispatch({ type: 'REQUEST_USER_API_KEY', payload: true });
            }
            console.error("AI set generation failed in context:", error);
            return null;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const fetchPublicSets = useCallback(async (page: number, searchTerm = '') => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const data = await api.getPublicSets(page, 9, searchTerm); // 9 per page for a 3-column layout
            dispatch({ type: 'PUBLIC_SETS_LOADED', payload: data });
        } catch (error) {
            console.error("Failed to fetch public sets:", error);
            if (error instanceof AuthError) {
                alert(error.message);
                logout();
            } else {
                alert((error as Error).message);
            }
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [logout]);


    const cloneSet = async (setId: string): Promise<VocabSet | undefined> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const { newSet, updatedUser } = await api.cloneSet(setId);
            await fetchSets(1); // Refetch user's sets to show the new one
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            
            // Also refetch stats
            const stats = await api.getUserStats();
            dispatch({ type: 'USER_STATS_LOADED', payload: stats });

            const storedUser = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
            if (storedUser) {
                const storage = localStorage.getItem(STORAGE_KEY) ? localStorage : sessionStorage;
                const user = JSON.parse(storedUser);
                const updatedStoredUser = { ...user, ...updatedUser };
                storage.setItem(STORAGE_KEY, JSON.stringify(updatedStoredUser));
            }
            
            alert(`Set "${newSet.title}" has been added to your collection!`);
            return newSet;
        } catch (error) {
            console.error("Failed to clone set:", error);
            if (error instanceof AuthError) {
                alert(error.message);
                logout();
            } else {
                alert((error as Error).message);
            }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const fetchProfileHistory = async () => {
        if (!state.user) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const fullHistory = await api.getQuizHistory(); // No limit
            dispatch({ type: 'PROFILE_HISTORY_LOADED', payload: fullHistory });
        } catch (error) {
            console.error("Failed to fetch full history:", error);
            if (error instanceof AuthError) {
                alert(error.message);
                logout();
            }
        }
    };

    const updateUserProfile = async (userData: { name: string }) => {
        if (!state.user) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const updatedUserWithToken = await api.updateUserProfile(userData);

            const storage = localStorage.getItem(STORAGE_KEY) ? localStorage : sessionStorage;
            storage.setItem(STORAGE_KEY, JSON.stringify(updatedUserWithToken));
            
            // Use LOGIN action to update user and token state comprehensively
            dispatch({ type: 'LOGIN', payload: updatedUserWithToken });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert((error as Error).message);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const fetchLeaderboard = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const data = await api.getLeaderboard();
            dispatch({ type: 'LEADERBOARD_LOADED', payload: data });
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
             if (error instanceof AuthError) {
                alert(error.message);
                logout();
            } else {
                 alert("Could not load the leaderboard.");
            }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [logout]);

    // --- Admin Functions ---
    const fetchAdminStats = useCallback(async () => {
        if (state.user?.role !== 'admin') return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const stats = await api.getAdminStats();
            dispatch({ type: 'ADMIN_STATS_LOADED', payload: stats });
        } catch (error) {
            console.error("Failed to fetch admin stats:", error);
            alert("Could not load admin statistics.");
        }
    }, [state.user?.role]);

    const fetchAdminUsers = useCallback(async (page: number) => {
        if (state.user?.role !== 'admin') return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const data = await api.getAdminAllUsers(page, 10);
            dispatch({ type: 'ADMIN_USERS_LOADED', payload: data });
        } catch (error) {
            console.error("Failed to fetch admin users:", error);
            alert("Could not load user list.");
        }
    }, [state.user?.role]);
    
    const adminDeleteUser = useCallback(async (userId: string) => {
        if (state.user?.role !== 'admin') return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await api.adminDeleteUser(userId);
            // Refetch current page of users
            await fetchAdminUsers(state.adminUsersPagination?.currentPage || 1);
            alert("User deleted successfully.");
        } catch(error) {
            console.error("Failed to delete user:", error);
            alert((error as Error).message);
        }
    }, [state.user?.role, fetchAdminUsers, state.adminUsersPagination?.currentPage]);


    useEffect(() => {
        if (state.user) {
            fetchInitialData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.user?.token]);


  return (
    <AppContext.Provider value={{ state, login, register, logout, fetchSets, saveSet, deleteSet, saveQuizResult, toggleNeedsReview, generateSetWithAI, generateExample, fetchPublicSets, cloneSet, closeApiKeyModal, fetchProfileHistory, updateUserProfile, fetchLeaderboard, fetchAdminStats, fetchAdminUsers, adminDeleteUser }}>
      {children}
    </AppContext.Provider>
  );
};