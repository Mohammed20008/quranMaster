'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { Reciter, reciters } from '@/data/reciters';
import { useUserData } from './user-data-context';
import { surahs } from '@/data/surah-data';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerseTiming {
  verseNumber: number;
  timestampFrom: number; // ms
  timestampTo: number;   // ms
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  currentSurah: number | null;
  currentVerse: number | null;
  playbackMode: 'surah' | 'verse' | null;
}

interface AudioContextType {
  state: AudioState;
  playSurah: (surahNumber: number) => void;
  playVerse: (surahNumber: number, verseNumber: number) => void;
  playPage: (surahNumber: number, pageNumber: number) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  stop: () => void;
  playNextVerse: () => void;
  playPreviousVerse: () => void;
  currentReciter: Reciter | undefined;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// ─── Verse timing cache (per reciter + surah) ─────────────────────────────────

const timingCache = new Map<string, VerseTiming[]>();

async function fetchVerseTimings(
  reciterId: number,
  surahNumber: number,
): Promise<VerseTiming[]> {
  const cacheKey = `${reciterId}-${surahNumber}`;
  if (timingCache.has(cacheKey)) return timingCache.get(cacheKey)!;

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/recitations/${reciterId}/by_chapter/${surahNumber}`,
    );
    if (!res.ok) throw new Error('Timing fetch failed');
    const json = await res.json();

    const timings: VerseTiming[] = (json.audio_files || []).map((f: any) => ({
      verseNumber: parseInt(f.verse_key.split(':')[1]),
      timestampFrom: f.timestamp_from,
      timestampTo: f.timestamp_to,
    }));

    timingCache.set(cacheKey, timings);
    return timings;
  } catch {
    return []; // Graceful fallback – highlight won't move but audio still plays
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AudioProvider({ children }: { children: ReactNode }) {
  const { settings } = useUserData();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    currentSurah: null,
    currentVerse: null,
    playbackMode: null,
  });

  // Verse timings for the currently playing Surah
  const verseTimingsRef = useRef<VerseTiming[]>([]);

  const currentReciter = reciters.find(r => r.id === settings.selectedReciterId);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const safePlay = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('Audio play error:', err);
    }
  };

  // ── Verse tracking during continuous surah playback ───────────────────────

  const updateCurrentVerseFromTime = useCallback((currentTimeMs: number) => {
    const timings = verseTimingsRef.current;
    if (!timings.length) return;

    // Find the verse whose window contains the current timestamp
    const active = timings.find(
      t => currentTimeMs >= t.timestampFrom && currentTimeMs < t.timestampTo,
    ) ?? timings[timings.length - 1];

    if (active && active.verseNumber !== stateRef.current.currentVerse) {
      setState(prev => ({ ...prev, currentVerse: active.verseNumber }));
    }
  }, []);

  // ── Play actions ──────────────────────────────────────────────────────────

  const playSurah = useCallback(async (surahNumber: number) => {
    if (!currentReciter || !audioRef.current) return;

    // Start playing the full Surah MP3 immediately
    const surahStr = surahNumber.toString().padStart(3, '0');
    const url = `${currentReciter.baseUrl}${surahStr}.mp3`;
    audioRef.current.src = url;
    safePlay();

    setState(prev => ({
      ...prev,
      currentSurah: surahNumber,
      currentVerse: 1, // Start at verse 1 until timings arrive
      playbackMode: 'surah',
      isPlaying: true,
    }));

    // Fetch verse timings in the background (non-blocking)
    if (currentReciter.quranComId) {
      verseTimingsRef.current = []; // Clear previous timings
      const timings = await fetchVerseTimings(currentReciter.quranComId, surahNumber);
      verseTimingsRef.current = timings;
    }
  }, [currentReciter]);

  const playVerse = useCallback((surahNumber: number, verseNumber: number) => {
    if (!currentReciter || !audioRef.current) return;
    verseTimingsRef.current = []; // No timing needed for single-verse mode

    const everyAyahKey = currentReciter.everyAyahKey || 'Alafasy_128kbps';
    const surahStr = surahNumber.toString().padStart(3, '0');
    const verseStr = verseNumber.toString().padStart(3, '0');
    const url = `https://www.everyayah.com/data/${everyAyahKey}/${surahStr}${verseStr}.mp3`;
    audioRef.current.src = url;
    safePlay();
    setState(prev => ({
      ...prev,
      currentSurah: surahNumber,
      currentVerse: verseNumber,
      playbackMode: 'verse',
      isPlaying: true,
    }));
  }, [currentReciter]);

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    verseTimingsRef.current = [];
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentSurah: null,
      currentVerse: null,
      playbackMode: null,
    }));
  };

  const playNextVerse = useCallback(() => {
    const s = stateRef.current;
    if (!s.currentSurah) return;
    const surah = surahs.find((x: any) => x.number === s.currentSurah);
    if (!surah) return;
    const cur = s.currentVerse || 0;
    if (cur < surah.totalVerses) {
      playVerse(s.currentSurah, cur + 1);
    } else if (s.currentSurah < 114) {
      playVerse(s.currentSurah + 1, 1);
    } else {
      stop();
    }
  }, [playVerse]);

  const playPreviousVerse = () => {
    const s = stateRef.current;
    if (!s.currentSurah) return;
    const cur = s.currentVerse || 1;
    if (cur > 1) {
      playVerse(s.currentSurah, cur - 1);
    } else if (s.currentSurah > 1) {
      const prev = surahs.find((x: any) => x.number === s.currentSurah! - 1);
      if (prev) playVerse(prev.number, prev.totalVerses);
    }
  };

  const playNextSurah = useCallback(() => {
    const s = stateRef.current;
    if (s.currentSurah && s.currentSurah < 114) {
      playSurah(s.currentSurah + 1);
    } else {
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [playSurah]);

  const playPage = async (surahNumber: number, pageNumber: number) => {
    // Just play the whole Surah continuously — page is just an entry point
    playSurah(surahNumber);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      safePlay();
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  };

  // ── Audio element lifecycle ───────────────────────────────────────────────

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      const ms = audio.currentTime * 1000;
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));

      // Update active verse based on timing data (only in surah mode)
      if (stateRef.current.playbackMode === 'surah') {
        updateCurrentVerseFromTime(ms);
      }
    };

    const handleDurationChange = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleEnded = () => {
      const s = stateRef.current;
      if (s.playbackMode === 'verse') {
        playNextVerse();
      } else if (s.playbackMode === 'surah') {
        playNextSurah();
      } else {
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        setState(prev => ({
          ...prev,
          buffered: audio.buffered.end(audio.buffered.length - 1),
        }));
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('progress', handleProgress);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('progress', handleProgress);
      audio.pause();
      audioRef.current = null;
    };
  }, [playNextSurah, playNextVerse, updateCurrentVerseFromTime]);

  return (
    <AudioContext.Provider value={{
      state, playSurah, playVerse, playPage, togglePlay, seek, stop,
      playNextVerse, playPreviousVerse, currentReciter,
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
