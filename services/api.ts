import { User, VocabSet, QuizHistory, QuizResultType } from '../types';

// const API_URL = 'http://localhost:5001/api'; // Your backend URL
const API_URL = process.env.URL

// Custom error for auth failures
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Helper to get the token from localStorage
const getToken = (): string | null => {
    const storedUser = localStorage.getItem('hanziflow_user');
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


// --- Vocab Sets ---
export const getSets = async (): Promise<VocabSet[]> => {
    return apiFetch(`${API_URL}/sets`);
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
export const getQuizHistory = async (): Promise<QuizHistory[]> => {
    return apiFetch(`${API_URL}/history`);
};

export const saveQuizResult = async (setId: string, result: QuizResultType): Promise<{ newHistoryItem: QuizHistory, updatedUser: Partial<User>, updatedSet?: VocabSet }> => {
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

// --- Community Features ---
export const getPublicSets = async (): Promise<VocabSet[]> => {
    return apiFetch(`${API_URL}/sets/community`);
};

export const getPublicSetDetails = async (setId: string): Promise<VocabSet> => {
    return apiFetch(`${API_URL}/sets/community/${setId}`);
};

export const cloneSet = async (setId: string): Promise<{ newSet: VocabSet, updatedUser: Partial<User> }> => {
    return apiFetch(`${API_URL}/sets/clone/${setId}`, { method: 'POST' });
};
