'use client';

import { useCallback, useRef, useMemo } from 'react';
import { createNarration } from '@/lib/narrate';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const play = useCallback((path: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      stop();
      const audio = new Audio(path);
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error(`Failed to play: ${path}`));
      audio.play().catch(reject);
    });
  }, [stop]);

  const playPhoneme = useCallback((phonemeId: string): Promise<void> => {
    return play(`/audio/phonemes/${phonemeId}.mp3`);
  }, [play]);

  const playNarration = useCallback((key: string): Promise<void> => {
    return play(`/audio/tts/${key}.mp3`);
  }, [play]);

  const playWord = useCallback((word: string): Promise<void> => {
    // Try pre-generated audio first, fall back to Web Speech API
    return play(`/audio/words/${word}.mp3`).catch(() => {
      return new Promise<void>((resolve) => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.lang = 'en-US';
          utterance.rate = 0.85;
          utterance.pitch = 1.1;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          speechSynthesis.speak(utterance);
        } else {
          resolve();
        }
      });
    });
  }, [play]);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1.1;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const narrate = useMemo(() => createNarration(playNarration, speak), [playNarration, speak]);

  return { play, playPhoneme, playNarration, playWord, speak, stop, narrate };
}
