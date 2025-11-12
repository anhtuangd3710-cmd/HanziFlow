import { User, VocabSet, QuizHistory, QuizResultType, UserStats, LeaderboardUser } from '../types';

const API_URL = process.env.URL; // Your backend URL

// Custom error for auth failures
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// In-memory token storage
let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Centralized fetch wrapper with token refresh logic
const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const makeRequest = async () => {
        const res = await fetch(url, { ...options, headers, credentials: 'include' });

        if (!res.ok) {
            if (res.status === 401) {
                if (isRefreshing) {
                    // If a refresh is already in progress, wait for it to complete
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve: () => resolve(makeRequest()), reject });
                    }).catch(() => {
                        // If the refresh fails, the original request should also fail.
                        throw new AuthError('Your session has expired. Please log in again.');
                    });
                }
                
                isRefreshing = true;

                try {
                    const newAccessToken = await refreshToken();
                    accessToken = newAccessToken;
                    headers['Authorization'] = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);
                    return makeRequest(); // Retry the original request with the new token
                } catch (refreshError) {
                    logoutUser(); // If refresh fails, log out
                    processQueue(refreshError as Error, null);
                    throw new AuthError('Your session has expired. Please log in again.');
                } finally {
                    isRefreshing = false;
                }
            }
            const errorData = await res.json().catch(() => ({ message: `Request failed with status ${res.status}` }));
            throw new Error(errorData.message || `An unknown API error occurred.`);
        }
        
        if (res.status === 204) {
            return;
        }
        return res.json();
    };

    return makeRequest();
};


// --- Auth Endpoints ---
export const loginUser = async (email: string, password: string, rememberMe: boolean): Promise<User> => {
    const user = await apiFetch(`${API_URL}/users/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe }),
    });
    accessToken = user.accessToken;
    // We only care about the user data, not the token here
    const { accessToken: _, ...userData } = user;
    return userData;
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
    const user = await apiFetch(`${API_URL}/users/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
    accessToken = user.accessToken;
    const { accessToken: _, ...userData } = user;
    return userData;
};

export const logoutUser = async (): Promise<void> => {
    try {
        await apiFetch(`${API_URL}/users/logout`, { method: 'POST' });
    } catch (error) {
        console.error("Logout API call failed, but logging out client-side anyway.", error);
    } finally {
        accessToken = null; // Clear the token from memory
    }
};

const refreshToken = async (): Promise<string> => {
    const res = await apiFetch(`${API_URL}/users/refresh`, { method: 'POST' });
    return res.accessToken;
};

export const getProfile = async (): Promise<User> => {
    const user = await apiFetch(`${API_URL}/users/profile`);
    accessToken = user.accessToken;
    const { accessToken: _, ...userData } = user;
    return userData;
};


export const updateUserProfile = async (userData: { name: string }): Promise<User> => {
    const user = await apiFetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
     accessToken = user.accessToken;
    const { accessToken: _, ...userDataWithoutToken } = user;
    return userDataWithoutToken;
};


// --- Vocab Sets ---
export const getSets = async (page: number, limit: number): Promise<{ sets: VocabSet[], page: number, pages: number, total: number }> => {
    return apiFetch(`${API_URL}/sets?page=${page}&limit=${limit}`);
};

export const getSetById = async (setId: string): Promise<VocabSet> => {
    return apiFetch(`${API_URL}/sets/${setId}`);
};

export const saveSet = async (set: Partial<Omit<VocabSet, '_id' | 'user'>> & { _id?: string }): Promise<VocabSet> => {
    const isUpdate = !!set._id;
    const url = isUpdate ? `${API_URL}/sets/${set._id}` : `${API_URL}/sets`;
    const method = isUpdate ? 'PUT' : 'POST';

    return apiFetch(url, {
        method,
        body: JSON.stringify(set),
    });
};

export const deleteSet = async (setId: string): Promise<void> => {
    return apiFetch(`${API_URL}/sets/${setId}`, { method: 'DELETE' });
};

// --- Quiz History ---
export const getQuizHistory = async (limit?: number): Promise<QuizHistory[]> => {
    const url = limit ? `${API_URL}/history?limit=${limit}` : `${API_URL}/history`;
    return apiFetch(url);
};

export const saveQuizResult = async (setId: string, result: QuizResultType): Promise<{ updatedUser: Partial<User>, updatedSet?: VocabSet }> => {
    return apiFetch(`${API_URL}/history`, {
        method: 'POST',
        body: JSON.stringify({ 
            vocabSet: setId,
            score: result.score,
            total: result.total,
            questions: result.questions,
        }),
    });
};

// --- User Stats Endpoint ---
export const getUserStats = async (): Promise<UserStats> => {
    return apiFetch(`${API_URL}/history/stats`);
};


// --- Community Features ---
export const getPublicSets = async (page: number, limit: number, searchTerm?: string): Promise<{ sets: VocabSet[]; page: number; pages: number; total: number; }> => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });
    if (searchTerm) {
        params.append('search', searchTerm);
    }
    return apiFetch(`${API_URL}/sets/community?${params.toString()}`);
};

export const getPublicSetDetails = async (setId: string): Promise<VocabSet> => {
    return apiFetch(`${API_URL}/sets/community/${setId}`);
};

export const cloneSet = async (setId: string): Promise<{ newSet: VocabSet, updatedUser: Partial<User> }> => {
    return apiFetch(`${API_URL}/sets/clone/${setId}`, { method: 'POST' });
};

// --- Leaderboard ---
export const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
    return apiFetch(`${API_URL}/users/leaderboard`);
};
