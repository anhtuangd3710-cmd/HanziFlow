'use client';

import React, { createContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import * as audioApi from '@/lib/api';

export interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  folderId: string;
  uploadedAt: string;
  size: number; // in bytes
}

export interface AudioFolder {
  id: string;
  name: string;
  createdAt: string;
  audioCount: number;
}

export interface AudioState {
  folders: AudioFolder[];
  audioFiles: AudioFile[];
  currentFolderId: string | null;
  currentAudio: AudioFile | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number; // 0.5, 0.75, 1, 1.25, 1.5, 2
  loopMode: 'off' | 'one' | 'all'; // off, loop one, loop all
  volume: number; // 0-1
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}

type AudioAction =
  | { type: 'SET_FOLDERS'; payload: AudioFolder[] }
  | { type: 'ADD_FOLDER'; payload: AudioFolder }
  | { type: 'DELETE_FOLDER'; payload: string }
  | { type: 'RENAME_FOLDER'; payload: { id: string; name: string } }
  | { type: 'SET_AUDIO_FILES'; payload: AudioFile[] }
  | { type: 'ADD_AUDIO_FILE'; payload: AudioFile }
  | { type: 'DELETE_AUDIO_FILE'; payload: string }
  | { type: 'SET_CURRENT_FOLDER'; payload: string | null }
  | { type: 'SET_CURRENT_AUDIO'; payload: AudioFile | null }
  | { type: 'SET_IS_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_PLAYBACK_SPEED'; payload: number }
  | { type: 'SET_LOOP_MODE'; payload: 'off' | 'one' | 'all' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

interface AudioContextType {
  state: AudioState;
  createFolder: (name: string) => void;
  deleteFolder: (folderId: string) => void;
  renameFolder: (folderId: string, name: string) => void;
  uploadAudioFiles: (folderId: string, files: File[]) => Promise<void>;
  uploadFolderWithFiles: (folderName: string, files: File[]) => Promise<AudioFolder>;
  deleteAudioFile: (fileId: string) => void;
  playAudio: (audio: AudioFile) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  nextAudio: () => void;
  previousAudio: () => void;
  setCurrentTime: (time: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setLoopMode: (mode: 'off' | 'one' | 'all') => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentFolder: (folderId: string | null) => void;
  loadFolders: () => Promise<void>;
  loadAudioFiles: (folderId: string) => Promise<void>;
}

const initialState: AudioState = {
  folders: [],
  audioFiles: [],
  currentFolderId: null,
  currentAudio: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackSpeed: 1,
  loopMode: 'off',
  volume: 1,
  isMuted: false,
  isLoading: false,
  error: null,
};

const audioReducer = (state: AudioState, action: AudioAction): AudioState => {
  switch (action.type) {
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload };
    case 'ADD_FOLDER':
      return { ...state, folders: [...state.folders, action.payload] };
    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter(f => f.id !== action.payload),
        currentFolderId: state.currentFolderId === action.payload ? null : state.currentFolderId,
      };
    case 'RENAME_FOLDER':
      return {
        ...state,
        folders: state.folders.map(f =>
          f.id === action.payload.id ? { ...f, name: action.payload.name } : f
        ),
      };
    case 'SET_AUDIO_FILES':
      return { ...state, audioFiles: action.payload };
    case 'ADD_AUDIO_FILE':
      return { ...state, audioFiles: [...state.audioFiles, action.payload] };
    case 'DELETE_AUDIO_FILE':
      return {
        ...state,
        audioFiles: state.audioFiles.filter(f => f.id !== action.payload),
        currentAudio: state.currentAudio?.id === action.payload ? null : state.currentAudio,
      };
    case 'SET_CURRENT_FOLDER':
      return { ...state, currentFolderId: action.payload, audioFiles: [] };
    case 'SET_CURRENT_AUDIO':
      return { ...state, currentAudio: action.payload, currentTime: 0 };
    case 'SET_IS_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_PLAYBACK_SPEED':
      return { ...state, playbackSpeed: action.payload };
    case 'SET_LOOP_MODE':
      return { ...state, loopMode: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: Math.max(0, Math.min(1, action.payload)) };
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

export const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(audioReducer, initialState);

  // Load folders from backend on mount (not localStorage!)
  useEffect(() => {
    const loadInitialFolders = async () => {
      // Check if user is logged in before making API call
      const storedUser = localStorage.getItem('hanziflow_user') || sessionStorage.getItem('hanziflow_user');
      if (!storedUser) {
        return; // Don't try to load if not logged in
      }

      try {
        const response = await audioApi.getAudioFolders();
        if (response.success) {
          const folders: AudioFolder[] = response.data.map(f => ({
            id: f._id,
            name: f.name,
            createdAt: f.createdAt,
            audioCount: 0,
          }));
          dispatch({ type: 'SET_FOLDERS', payload: folders });
          // Clear old localStorage once we have backend data
          localStorage.removeItem('audioFolders');
          localStorage.removeItem('audioFiles');
        }
      } catch (error) {
        console.error('Failed to load folders on init:', error);
        // Only use localStorage if backend fails
        const savedFolders = localStorage.getItem('audioFolders');
        if (savedFolders) {
          try {
            const folders = JSON.parse(savedFolders);
            dispatch({ type: 'SET_FOLDERS', payload: folders });
          } catch {}
        }
      }
    };
    loadInitialFolders();
  }, []);

  // Save folders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('audioFolders', JSON.stringify(state.folders));
  }, [state.folders]);

  // Load audio files from localStorage
  useEffect(() => {
    const savedAudioFiles = localStorage.getItem('audioFiles');
    if (savedAudioFiles) {
      try {
        const files = JSON.parse(savedAudioFiles);
        dispatch({ type: 'SET_AUDIO_FILES', payload: files });
      } catch (error) {
        console.error('Failed to load audio files:', error);
      }
    }
  }, []);

  // Save audio files to localStorage
  useEffect(() => {
    localStorage.setItem('audioFiles', JSON.stringify(state.audioFiles));
  }, [state.audioFiles]);

  const createFolder = useCallback(async (name: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await audioApi.createAudioFolder(name);
      
      if (response.success) {
        const backendFolder = response.data;
        const folder: AudioFolder = {
          id: backendFolder._id,
          name: backendFolder.name,
          createdAt: backendFolder.createdAt,
          audioCount: 0,
        };
        dispatch({ type: 'ADD_FOLDER', payload: folder });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      console.error('Failed to create folder:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteFolder = useCallback(async (folderId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await audioApi.deleteAudioFolder(folderId);
      
      if (response.success) {
        dispatch({ type: 'DELETE_FOLDER', payload: folderId });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      console.error('Failed to delete folder:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const renameFolder = useCallback((folderId: string, name: string) => {
    dispatch({ type: 'RENAME_FOLDER', payload: { id: folderId, name } });
  }, []);

  const uploadAudioFiles = useCallback(async (folderId: string, files: File[]) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      for (const file of files) {
        if (!file.type.startsWith('audio/')) {
          continue; // Skip non-audio files
        }

        // Get duration using Audio element
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });

        const audio = new Audio(dataUrl);
        const duration = await new Promise<number>((resolve) => {
          audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
          });
        });

        // Upload file using FormData
        try {
          const response = await audioApi.uploadAudioFile(folderId, file, duration);
          
          if (response.success) {
            const backendFile = response.data;
            const audioFile: AudioFile = {
              id: backendFile._id,
              name: backendFile.name,
              url: backendFile.cloudinaryUrl,
              duration: backendFile.duration,
              folderId,
              uploadedAt: backendFile.uploadedAt,
              size: backendFile.size,
            };
            dispatch({ type: 'ADD_AUDIO_FILE', payload: audioFile });
          }
        } catch (error) {
          console.error('Failed to upload audio file:', error);
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteAudioFile = useCallback(async (fileId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await audioApi.deleteAudioFile(fileId);
      
      if (response.success) {
        dispatch({ type: 'DELETE_AUDIO_FILE', payload: fileId });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      console.error('Failed to delete audio file:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const uploadFolderWithFiles = useCallback(async (folderName: string, files: File[]) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Create folder on backend
      const folderResponse = await audioApi.createAudioFolder(folderName);
      if (!folderResponse.success) {
        throw new Error('Failed to create folder');
      }
      
      const backendFolder = folderResponse.data;
      const newFolder: AudioFolder = {
        id: backendFolder._id,
        name: backendFolder.name,
        createdAt: backendFolder.createdAt,
        audioCount: 0,
      };
      dispatch({ type: 'ADD_FOLDER', payload: newFolder });

      // Upload files to new folder
      for (const file of files) {
        if (!file.type.startsWith('audio/')) {
          continue; // Skip non-audio files
        }

        // Get duration using Audio element
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });

        const audio = new Audio(dataUrl);
        const duration = await new Promise<number>((resolve) => {
          audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
          });
        });

        // Upload file using FormData
        try {
          const response = await audioApi.uploadAudioFile(newFolder.id, file, duration);
          
          if (response.success) {
            const backendFile = response.data;
            const audioFile: AudioFile = {
              id: backendFile._id,
              name: backendFile.name,
              url: backendFile.cloudinaryUrl,
              duration: backendFile.duration,
              folderId: newFolder.id,
              uploadedAt: backendFile.uploadedAt,
              size: backendFile.size,
            };
            dispatch({ type: 'ADD_AUDIO_FILE', payload: audioFile });
          }
        } catch (error) {
          console.error('Failed to upload audio file:', error);
        }
      }

      return newFolder;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const playAudio = useCallback((audio: AudioFile) => {
    dispatch({ type: 'SET_CURRENT_AUDIO', payload: audio });
    dispatch({ type: 'SET_IS_PLAYING', payload: true });
  }, []);

  const pauseAudio = useCallback(() => {
    dispatch({ type: 'SET_IS_PLAYING', payload: false });
  }, []);

  const resumeAudio = useCallback(() => {
    if (state.currentAudio) {
      dispatch({ type: 'SET_IS_PLAYING', payload: true });
    }
  }, [state.currentAudio]);

  const stopAudio = useCallback(() => {
    dispatch({ type: 'SET_IS_PLAYING', payload: false });
    dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
  }, []);

  const nextAudio = useCallback(() => {
    if (!state.currentAudio || !state.currentFolderId) return;
    
    const currentIndex = state.audioFiles.findIndex(f => f.id === state.currentAudio?.id);
    const nextIndex = (currentIndex + 1) % state.audioFiles.length;
    
    if (state.audioFiles[nextIndex]) {
      playAudio(state.audioFiles[nextIndex]);
    }
  }, [state.currentAudio, state.audioFiles, state.currentFolderId, playAudio]);

  const previousAudio = useCallback(() => {
    if (!state.currentAudio || !state.currentFolderId) return;
    
    const currentIndex = state.audioFiles.findIndex(f => f.id === state.currentAudio?.id);
    const previousIndex = (currentIndex - 1 + state.audioFiles.length) % state.audioFiles.length;
    
    if (state.audioFiles[previousIndex]) {
      playAudio(state.audioFiles[previousIndex]);
    }
  }, [state.currentAudio, state.audioFiles, state.currentFolderId, playAudio]);

  const setCurrentTime = useCallback((time: number) => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_PLAYBACK_SPEED', payload: speed });
  }, []);

  const setLoopMode = useCallback((mode: 'off' | 'one' | 'all') => {
    dispatch({ type: 'SET_LOOP_MODE', payload: mode });
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: 'SET_MUTED', payload: !state.isMuted });
  }, [state.isMuted]);

  const setCurrentFolder = useCallback((folderId: string | null) => {
    dispatch({ type: 'SET_CURRENT_FOLDER', payload: folderId });
  }, []);

  const loadFolders = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await audioApi.getAudioFolders();
      
      if (response.success) {
        const folders: AudioFolder[] = response.data.map(f => ({
          id: f._id,
          name: f.name,
          createdAt: f.createdAt,
          audioCount: 0,
        }));
        dispatch({ type: 'SET_FOLDERS', payload: folders });
        // Clear old localStorage data since we got fresh data from backend
        localStorage.removeItem('audioFolders');
        localStorage.removeItem('audioFiles');
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
      // Fall back to localStorage only if backend is unreachable
      const savedFolders = localStorage.getItem('audioFolders');
      if (savedFolders) {
        try {
          const folders = JSON.parse(savedFolders);
          dispatch({ type: 'SET_FOLDERS', payload: folders });
        } catch {}
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadAudioFiles = useCallback(async (folderId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await audioApi.getAudioFiles(folderId);
      
      if (response.success) {
        const audioFiles: AudioFile[] = response.data.map((f: any) => ({
          id: f._id,
          name: f.name,
          url: f.cloudinaryUrl,  // Use Cloudinary URL directly
          duration: f.duration,
          folderId: f.folderId,
          uploadedAt: f.uploadedAt,
          size: f.size,
        }));
        dispatch({ type: 'SET_AUDIO_FILES', payload: audioFiles });
      }
    } catch (error) {
      console.error('Failed to load audio files:', error);
      // Fall back to localStorage
      const savedAudioFiles = localStorage.getItem('audioFiles');
      if (savedAudioFiles) {
        try {
          const files = JSON.parse(savedAudioFiles);
          const folderFiles = files.filter((f: AudioFile) => f.folderId === folderId);
          dispatch({ type: 'SET_AUDIO_FILES', payload: folderFiles });
        } catch {}
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  return (
    <AudioContext.Provider
      value={{
        state,
        createFolder,
        deleteFolder,
        renameFolder,
        uploadAudioFiles,
        uploadFolderWithFiles,
        deleteAudioFile,
        playAudio,
        pauseAudio,
        resumeAudio,
        stopAudio,
        nextAudio,
        previousAudio,
        setCurrentTime,
        setPlaybackSpeed,
        setLoopMode,
        setVolume,
        toggleMute,
        setCurrentFolder,
        loadFolders,
        loadAudioFiles,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
