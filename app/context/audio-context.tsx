'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Reciter, reciters } from '@/data/reciters';
import { useUserData } from './user-data-context';
import { fetchSurahQPCData } from '@/app/actions/get-qpc-data';
import { surahs } from '@/data/surah-data';

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

const AudioContext = createContext<AudioContextType | undefined>(undefined);

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

  const currentReciter = reciters.find(r => r.id === settings.selectedReciterId);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const safePlay = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Audio play error:', err);
      }
    }
  };

  const playSurah = (surahNumber: number) => {
    if (!currentReciter || !audioRef.current) return;
    const surahStr = surahNumber.toString().padStart(3, '0');
    const url = `${currentReciter.baseUrl}${surahStr}.mp3`;
    audioRef.current.src = url;
    safePlay();
    setState(prev => ({
      ...prev,
      currentSurah: surahNumber,
      currentVerse: null,
      playbackMode: 'surah',
      isPlaying: true
    }));
  };

  const playVerse = (surahNumber: number, verseNumber: number) => {
    if (!currentReciter || !audioRef.current) return;
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
      isPlaying: true
    }));
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentSurah: null,
      currentVerse: null,
      playbackMode: null
    }));
  };

  const playNextVerse = () => {
    const currentState = stateRef.current;
    if (currentState.currentSurah) {
        const surah = surahs.find((s: any) => s.number === currentState.currentSurah);
        if (!surah) return;
        const currentV = currentState.currentVerse || 0;
        if (currentV < surah.totalVerses) {
            playVerse(currentState.currentSurah, currentV + 1);
        } else if (currentState.currentSurah < 114) {
            playVerse(currentState.currentSurah + 1, 1);
        } else {
            stop();
        }
    }
  };

  const playPreviousVerse = () => {
    const currentState = stateRef.current;
    if (currentState.currentSurah) {
        const currentV = currentState.currentVerse || 1;
        if (currentV > 1) {
            playVerse(currentState.currentSurah, currentV - 1);
        } else if (currentState.currentSurah > 1) {
            const prevSurah = surahs.find((s: any) => s.number === currentState.currentSurah! - 1);
            if (prevSurah) {
                playVerse(prevSurah.number, prevSurah.totalVerses);
            }
        }
    }
  };

  const playNextSurah = () => {
    const currentState = stateRef.current;
    if (currentState.currentSurah && currentState.currentSurah < 114) {
        playSurah(currentState.currentSurah + 1);
    } else {
        setState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const playPage = async (surahNumber: number, pageNumber: number) => {
    if (!currentReciter || !audioRef.current) return;
    try {
        const data = await fetchSurahQPCData(surahNumber);
        const firstVerseOfPage = data.find(v => v.page === pageNumber);
        if (firstVerseOfPage) {
            const verseNumber = parseInt(firstVerseOfPage.id.split(':')[1]);
            playVerse(surahNumber, verseNumber);
        } else {
            playSurah(surahNumber);
        }
    } catch (e) {
        console.error("Error playing page", e);
        playSurah(surahNumber);
    }
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

  const preloaderRef = useRef<HTMLAudioElement | null>(null);
  
  const preloadNextVerse = () => {
    const currentState = stateRef.current;
    if (currentState.currentSurah && currentState.playbackMode === 'verse' && currentReciter) {
        const surah = surahs.find((s: any) => s.number === currentState.currentSurah);
        if (!surah) return;

        let nextSurah = currentState.currentSurah;
        let nextVerse = (currentState.currentVerse || 0) + 1;

        if (nextVerse > surah.totalVerses) {
            if (nextSurah < 114) {
                nextSurah++;
                nextVerse = 1;
            } else {
                return;
            }
        }

        const everyAyahKey = currentReciter.everyAyahKey || 'Alafasy_128kbps';
        const surahStr = nextSurah.toString().padStart(3, '0');
        const verseStr = nextVerse.toString().padStart(3, '0');
        const url = `https://www.everyayah.com/data/${everyAyahKey}/${surahStr}${verseStr}.mp3`;

        if (preloaderRef.current && preloaderRef.current.src !== url) {
            console.log('Preloading next verse:', `${nextSurah}:${nextVerse}`);
            preloaderRef.current.src = url;
            preloaderRef.current.load();
        }
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const preloader = new Audio();
    preloader.preload = 'auto';
    preloaderRef.current = preloader;

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleDurationChange = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
      preloadNextVerse();
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleEnded = () => {
      const currentState = stateRef.current;
      if (currentState.playbackMode === 'verse') {
          playNextVerse();
      } else if (currentState.playbackMode === 'surah') {
          playNextSurah();
      } else {
          setState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        setState(prev => ({ ...prev, buffered: audio.buffered.end(audio.buffered.length - 1) }));
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
      preloaderRef.current = null;
    };
  }, []);

  return (
    <AudioContext.Provider value={{ 
      state, playSurah, playVerse, playPage, togglePlay, seek, stop, 
      playNextVerse, playPreviousVerse, currentReciter 
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
