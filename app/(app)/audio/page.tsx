'use client';

import React, { useContext, useState, useRef, useEffect } from 'react';
import { AudioContext } from '@/context/AudioContext';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { UploadIcon } from '@/components/icons/UploadIcon';
import { PlayIcon } from '@/components/icons/PlayIcon';
import Spinner from '@/components/Spinner';

export default function AudioPlayerPage() {
  const context = useContext(AudioContext);
  const [folderName, setFolderName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [uploadingFolderId, setUploadingFolderId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  if (!context) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const {
    state,
    createFolder,
    deleteFolder,
    uploadAudioFiles,
    uploadFolderWithFiles,
    deleteAudioFile,
    playAudio,
    setCurrentFolder,
    loadFolders,
    loadAudioFiles,
  } = context;

  // Load folders and their files on mount
  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  // Load audio files when a folder is selected
  useEffect(() => {
    if (selectedFolderId) {
      loadAudioFiles(selectedFolderId);
    }
  }, [selectedFolderId, loadAudioFiles]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      createFolder(folderName);
      setFolderName('');
    }
  };

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>, folderId: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadingFolderId(folderId);
      try {
        await uploadAudioFiles(folderId, files);
      } finally {
        setUploadingFolderId(null);
      }
    }
  };

  const handleUploadFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Extract folder name from the first file's webkitRelativePath
      let folderNameFromFiles = 'Imported Folder';
      if (files[0].webkitRelativePath) {
        const parts = files[0].webkitRelativePath.split('/');
        if (parts.length > 0) {
          folderNameFromFiles = parts[0];
        }
      }

      setUploadingFolderId('uploading');
      try {
        await uploadFolderWithFiles(folderNameFromFiles, files);
      } finally {
        setUploadingFolderId(null);
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const files: File[] = [];

    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const entry = items[i].webkitGetAsEntry();
          if (entry?.isDirectory) {
            // Handle directory drop
            await traverseDirectory(entry as FileSystemDirectoryEntry, files);
          } else {
            const file = items[i].getAsFile();
            if (file) files.push(file);
          }
        }
      }
    }

    if (files.length > 0) {
      if (selectedFolderId) {
        setUploadingFolderId(selectedFolderId);
        try {
          await uploadAudioFiles(selectedFolderId, files);
        } finally {
          setUploadingFolderId(null);
        }
      } else {
        // If no folder selected, create a new one from first file's path
        const folderNameFromFiles = 'Dropped Folder';
        setUploadingFolderId('uploading');
        try {
          await uploadFolderWithFiles(folderNameFromFiles, files);
        } finally {
          setUploadingFolderId(null);
        }
      }
    }
  };

  const traverseDirectory = async (
    entry: FileSystemDirectoryEntry,
    files: File[]
  ): Promise<void> => {
    const reader = entry.createReader();
    const entries = await new Promise<FileSystemEntry[]>((resolve) => {
      reader.readEntries(resolve);
    });

    for (const item of entries) {
      if (item.isFile) {
        const file = await new Promise<File>((resolve) => {
          (item as FileSystemFileEntry).file(resolve);
        });
        files.push(file);
      } else if (item.isDirectory) {
        await traverseDirectory(item as FileSystemDirectoryEntry, files);
      }
    }
  };

  const currentFolderAudioFiles = state.audioFiles.filter(
    f => f.folderId === selectedFolderId
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto pb-32">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🎵 Audio Player</h1>
        <p className="text-gray-600">Organize, manage, and play your audio files with advanced controls</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Folders */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📁 Folders</h2>

            {/* Create Folder Form */}
            <form onSubmit={handleCreateFolder} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={folderName}
                  onChange={e => setFolderName(e.target.value)}
                  placeholder="New folder name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  title="Create folder"
                >
                  <PlusIcon size={20} />
                </button>
              </div>
            </form>

            {/* Upload Folder Button */}
            <div className="mb-6">
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition font-semibold text-sm">
                <UploadIcon size={18} />
                Import Folder
                <input
                  ref={folderInputRef}
                  type="file"
                  multiple
                  onChange={handleUploadFolder}
                  disabled={uploadingFolderId === 'uploading'}
                  className="hidden"
                  {...({ webkitdirectory: 'true' } as any)}
                />
              </label>
            </div>

            {/* Folders List */}
            <div className="space-y-2">
              {state.folders.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No folders yet. Create one to get started!</p>
              ) : (
                state.folders.map(folder => (
                  <div
                    key={folder.id}
                    onClick={() => {
                      setSelectedFolderId(folder.id);
                      setCurrentFolder(folder.id);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedFolderId === folder.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 truncate">{folder.name}</p>
                        <p className="text-xs text-gray-500">
                          {state.audioFiles.filter(f => f.folderId === folder.id).length} files
                        </p>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm(`Delete folder "${folder.name}"? This will not delete the files.`)) {
                            deleteFolder(folder.id);
                            if (selectedFolderId === folder.id) {
                              setSelectedFolderId(null);
                              setCurrentFolder(null);
                            }
                          }
                        }}
                        className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                        title="Delete folder"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main: Audio Files */}
        <div className="lg:col-span-2">
          {selectedFolderId ? (
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`bg-white rounded-lg shadow-lg p-6 transition ${
                isDragging ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Audio Files</h2>
                <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition font-semibold">
                  <UploadIcon size={18} />
                  Upload
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={e => handleUploadFiles(e, selectedFolderId)}
                    disabled={uploadingFolderId === selectedFolderId}
                    className="hidden"
                  />
                </label>
              </div>

              {isDragging && (
                <div className="mb-4 p-4 bg-blue-100 border-2 border-blue-400 border-dashed rounded-lg text-center">
                  <p className="text-blue-700 font-semibold">Drop your audio files or folder here</p>
                </div>
              )}

              {uploadingFolderId === selectedFolderId && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                  <Spinner />
                  <span className="text-sm text-blue-700">Uploading files...</span>
                </div>
              )}

              {currentFolderAudioFiles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No audio files in this folder</p>
                  <div className="flex flex-col gap-2 items-center">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition">
                      <UploadIcon size={18} />
                      Upload Audio Files
                      <input
                        type="file"
                        multiple
                        accept="audio/*"
                        onChange={e => handleUploadFiles(e, selectedFolderId)}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-400">or drag & drop files here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentFolderAudioFiles.map(audio => (
                    <div
                      key={audio.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{audio.name}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>Duration: {formatTime(audio.duration)}</span>
                          <span>Size: {formatFileSize(audio.size)}</span>
                          <span>Uploaded: {new Date(audio.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => playAudio(audio)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition"
                          title="Play audio"
                        >
                          <PlayIcon size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${audio.name}"?`)) {
                              deleteAudioFile(audio.id);
                            }
                          }}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-full transition"
                          title="Delete audio"
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">Select a folder from the left to view and manage audio files</p>
              <p className="text-gray-400">Or create a new folder to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Current Playing */}
      {state.currentAudio && (
        <div className="fixed bottom-32 left-4 right-4 max-w-sm mx-auto bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-600">
          <p className="text-xs text-gray-500">Now Playing</p>
          <p className="font-semibold text-gray-800 truncate">{state.currentAudio.name}</p>
          <p className="text-xs text-gray-600 mt-1">
            {state.isPlaying ? '▶️ Playing' : '⏸️ Paused'} at {state.playbackSpeed}x speed
          </p>
        </div>
      )}
    </div>
  );
}
