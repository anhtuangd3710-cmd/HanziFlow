import { User, VocabSet, QuizHistory, QuizResultType, UserStats, LeaderboardUser, AdminStats, AdminUser } from '../types';

const API_URL = process.env.URL; // Your backend URL

// import { User, VocabSet, QuizHistory, QuizResultType, UserStats, LeaderboardUser, AdminStats, AdminUser } from '../types';

// const API_URL = 'http://localhost:5001/api'; // Your backend URL

// Custom error for auth failures
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Helper to get the token from localStorage
const getToken = (): string | null => {
    const storedUser = localStorage.getItem('hanziflow_user') || sessionStorage.getItem('hanziflow_user');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            return user.token || null;
        } catch {
            return null;
        }
    }
    return null;
};

// Centralized fetch wrapper for authenticated routes
const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
        throw new AuthError('Your session has expired. Please log in again.');
    }

    if (res.status === 403) {
        throw new AuthError('You are not authorized to perform this action.');
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Request failed with status ${res.status}` }));
        throw new Error(errorData.message || `An unknown API error occurred.`);
    }
    
    // Handle responses with no content (e.g., DELETE 204)
    if (res.status === 204) {
        return;
    }

    return res.json();
};


// --- Auth (These do not use apiFetch as they don't require a token) ---
export const loginUser = async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
    }
    return await res.json();
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed');
    }
    return await res.json();
};

export const updateUserProfile = async (userData: { name: string }): Promise<User> => {
    return apiFetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
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

// --- New User Stats Endpoint ---
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

// --- Admin ---
export const getAdminStats = async (): Promise<AdminStats> => {
    return apiFetch(`${API_URL}/admin/stats`);
};

export const getAdminAllUsers = async (page: number, limit: number): Promise<{ users: AdminUser[]; page: number; pages: number; }> => {
    return apiFetch(`${API_URL}/admin/users?page=${page}&limit=${limit}`);
};

export const adminDeleteUser = async (userId: string): Promise<void> => {
    return apiFetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE' });
};

export const exportAllUsers = async (): Promise<AdminUser[]> => {
    return apiFetch(`${API_URL}/admin/export/users`);
};
