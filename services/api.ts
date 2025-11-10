import { User, VocabSet, QuizHistory, QuizResultType } from '../types';

// const API_URL = 'http://localhost:5001/api'; // Your backend URL
const API_URL = process.env.URL

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

// --- Auth ---
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
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/sets`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        throw new Error("Failed to fetch sets");
    }
    return await res.json();
};

export const saveSet = async (set: Partial<Omit<VocabSet, '_id' | 'user'>> & { _id?: string }): Promise<VocabSet> => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const isUpdate = !!set._id;
    const url = isUpdate ? `${API_URL}/sets/${set._id}` : `${API_URL}/sets`;
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(set),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save set");
    }
    return await res.json();
};

export const deleteSet = async (setId: string): Promise<void> => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/sets/${setId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error("Failed to delete set");
    }
};

// --- Quiz History ---
export const getQuizHistory = async (): Promise<QuizHistory[]> => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        throw new Error("Failed to fetch quiz history");
    }
    return await res.json();
};

export const saveQuizResult = async (setId: string, result: QuizResultType): Promise<{ newHistoryItem: QuizHistory, updatedUser: Partial<User>, updatedSet?: VocabSet }> => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/history`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            vocabSet: setId,
            score: result.score,
            total: result.total,
            questions: result.questions, // Send full questions for SRS processing
        }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save quiz result");
    }
    return await res.json();
};

// --- Community Features ---
export const getPublicSets = async (): Promise<VocabSet[]> => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/sets/community`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        throw new Error("Failed to fetch community sets");
    }
    return await res.json();
};

export const getPublicSetDetails = async (setId: string): Promise<VocabSet> => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/sets/community/${setId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        throw new Error("Failed to fetch set details");
    }
    return await res.json();
};

export const cloneSet = async (setId: string): Promise<{ newSet: VocabSet, updatedUser: Partial<User> }> => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/sets/clone/${setId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to clone set");
    }
    return await res.json();
};