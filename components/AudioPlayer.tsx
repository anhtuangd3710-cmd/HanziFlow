'use client';

import React, { useContext, useRef, useEffect } from 'react';
import { AudioContext } from '@/context/AudioContext';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { SkipBackIcon } from './icons/SkipBackIcon';
import { SkipForwardIcon } from './icons/SkipForwardIcon';
import { VolumeIcon } from './icons/VolumeIcon';
import { Volume2Icon } from './icons/Volume2Icon';
import Spinner from './Spinner';

const AudioPlayer: React.FC = () => {
  const context = useContext(AudioContext);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [actualDuration, setActualDuration] = React.useState(0);

  if (!context) return null;

  const {
    state,
    pauseAudio,
    resumeAudio,
    nextAudio,
    previousAudio,
    setCurrentTime,
    setPlaybackSpeed,
    setLoopMode,
    setVolume,
    toggleMute,
  } = context;

  const { currentAudio, isPlaying, currentTime, duration, playbackSpeed, loopMode, volume, isMuted } = state;
  const displayDuration = actualDuration || duration;

  // Sync audio element with context state
  useEffect(() => {
    if (!audioRef.current || !currentAudio) return;

    audioRef.current.src = currentAudio.url;

    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error('Failed to play audio:', error);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentAudio]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setActualDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (loopMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (loopMode === 'all') {
      nextAudio();
    } else {
      pauseAudio();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const loopOptions: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <audio
        ref={audioRef}
        src={currentAudio?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Current Audio Info */}
        <div className="mb-4">
          {currentAudio ? (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800 truncate">{currentAudio.name}</h3>
                <p className="text-xs text-gray-500">
                  {formatTime(currentTime)} / {formatTime(displayDuration)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No audio selected</p>
          )}
        </div>

        {/* Progress Bar */}
        {currentAudio && (
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={displayDuration || 0}
              value={currentTime}
              onChange={e => {
                if (audioRef.current) {
                  audioRef.current.currentTime = parseFloat(e.target.value);
                }
              }}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={previousAudio}
              disabled={!currentAudio}
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Previous"
            >
              <SkipBackIcon size={20} />
            </button>

            <button
              onClick={isPlaying ? pauseAudio : resumeAudio}
              disabled={!currentAudio}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>

            <button
              onClick={nextAudio}
              disabled={!currentAudio}
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Next"
            >
              <SkipForwardIcon size={20} />
            </button>
          </div>

          {/* Center: Speed Control */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600">Speed:</label>
            <select
              value={playbackSpeed}
              onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {speedOptions.map(speed => (
                <option key={speed} value={speed}>
                  {speed}x
                </option>
              ))}
            </select>
          </div>

          {/* Center-Right: Loop Control */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600">Loop:</label>
            <select
              value={loopMode}
              onChange={e => setLoopMode(e.target.value as 'off' | 'one' | 'all')}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="off">Off</option>
              <option value="one">One</option>
              <option value="all">All</option>
            </select>
          </div>

          {/* Right: Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1 hover:bg-gray-100 rounded-full transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <Volume2Icon size={18} /> : <VolumeIcon size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={e => {
                setVolume(parseFloat(e.target.value));
              }}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
