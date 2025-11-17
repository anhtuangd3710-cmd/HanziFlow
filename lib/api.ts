import { User, VocabSet, QuizHistory, QuizResultType, UserStats, LeaderboardUser, AdminStats, AdminUser } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL 
// Custom error for auth failures
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Helper to get the token from localStorage
const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
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

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
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

export const registerUser = async (name: string, email: string, password: string): Promise<{ message: string, email: string }> => {
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

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send reset email');
    }
    return await res.json();
};

export const resetPassword = async (token: string, email: string, newPassword: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to reset password');
    }
    return await res.json();
};

export const verifyEmail = async (token: string, email: string): Promise<User> => {
    const res = await fetch(`${API_URL}/users/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to verify email');
    }
    return await res.json();
};

export const googleAuth = async (googleId: string, name: string, email: string): Promise<User> => {
    const res = await fetch(`${API_URL}/users/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleId, name, email }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Google login failed');
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

export const getAdminAllUsers = async (page: number, limit: number): Promise<{ users: AdminUser[]; currentPage: number; totalPages: number; total: number; }> => {
    return apiFetch(`${API_URL}/admin/users?page=${page}&limit=${limit}`);
};

export const adminDeleteUser = async (userId: string): Promise<void> => {
    return apiFetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE' });
};

export const blockUser = async (userId: string, reason: string): Promise<{ message: string; user: AdminUser }> => {
    return apiFetch(`${API_URL}/admin/users/${userId}/block`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
    });
};

export const unblockUser = async (userId: string): Promise<{ message: string; user: AdminUser }> => {
    return apiFetch(`${API_URL}/admin/users/${userId}/unblock`, {
        method: 'PUT',
    });
};

export const exportAllUsers = async (): Promise<AdminUser[]> => {
    return apiFetch(`${API_URL}/admin/export/users`);
};

// Audio API methods
export const createAudioFolder = async (name: string): Promise<{ success: boolean; data: any }> => {
    return apiFetch(`${API_URL}/audio/folders`, {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
};

export const getAudioFolders = async (): Promise<{ success: boolean; data: any[] }> => {
    return apiFetch(`${API_URL}/audio/folders`);
};

export const deleteAudioFolder = async (folderId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`${API_URL}/audio/folders/${folderId}`, {
        method: 'DELETE',
    });
};

export const uploadAudioFile = async (
    folderId: string,
    file: File,
    duration: number
): Promise<{ success: boolean; data: any }> => {
    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('folderId', folderId);
    formData.append('duration', duration.toString());

    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/audio/files`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData, // Don't set Content-Type, browser will set it with boundary
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
    }

    return response.json();
};

export const getAudioFiles = async (folderId: string): Promise<{ success: boolean; data: any[] }> => {
    return apiFetch(`${API_URL}/audio/files/${folderId}`);
};

export const getAudioFile = async (fileId: string): Promise<{ success: boolean; data: any }> => {
    return apiFetch(`${API_URL}/audio/file/${fileId}`);
};

// Get Cloudinary URL for audio playback
export const getAudioStreamUrl = (fileId: string): string => {
    // This is now handled by the backend which returns cloudinaryUrl directly
    // We'll fetch the URL from the database
    return `${API_URL}/audio/stream/${fileId}`;
};

export const deleteAudioFile = async (fileId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`${API_URL}/audio/files/${fileId}`, {
        method: 'DELETE',
    });
};

export const getAllAudioFiles = async (): Promise<{ success: boolean; data: any[] }> => {
    return apiFetch(`${API_URL}/audio/all/files`);
};

// API Key Management
export const saveApiKey = async (apiKey: string): Promise<{ message: string; hasApiKey: boolean }> => {
    return apiFetch(`${API_URL}/users/api-key`, {
        method: 'PUT',
        body: JSON.stringify({ apiKey }),
    });
};

export const getApiKey = async (): Promise<{ apiKey: string | null; hasApiKey: boolean }> => {
    return apiFetch(`${API_URL}/users/api-key`);
};

export const deleteApiKey = async (): Promise<{ message: string; hasApiKey: boolean }> => {
    return apiFetch(`${API_URL}/users/api-key`, {
        method: 'DELETE',
    });
};
