'use client';

import { useCallback, useRef, useMemo, useEffect } from 'react';
import { createNarration } from '@/lib/narrate';

/**
 * Find the best English voice available on this device.
 * Prefers en-US, then en-GB, then any en-* voice.
 * Returns null if no English voice found (will fall back to lang attribute).
 */
function findEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // Priority: en-US voices first, prefer non-compact/enhanced voices
  const enUS = voices.filter(v => v.lang === 'en-US');
  const preferred = enUS.find(v => /samantha|karen|daniel|premium|enhanced/i.test(v.name));
  if (preferred) return preferred;
  if (enUS.length > 0) return enUS[0];

  const enGB = voices.filter(v => v.lang === 'en-GB');
  if (enGB.length > 0) return enGB[0];

  const anyEn = voices.find(v => v.lang.startsWith('en'));
  if (anyEn) return anyEn;

  return null;
}

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const englishVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Load voices (async on some browsers)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        englishVoiceRef.current = findEnglishVoice(voices);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

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

  const speakWithVoice = useCallback((text: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1.1;
        // Explicitly set English voice if available (critical for iOS/Safari)
        if (englishVoiceRef.current) {
          utterance.voice = englishVoiceRef.current;
        }
        let resolved = false;
        const done = () => { if (!resolved) { resolved = true; resolve(); } };
        utterance.onend = done;
        utterance.onerror = done;
        // Safety timeout — iOS sometimes never fires onend
        setTimeout(done, 5000);
        speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }, []);

  const playWord = useCallback((word: string): Promise<void> => {
    // Try pre-generated audio first, fall back to Web Speech API
    return play(`/audio/words/${word}.mp3`).catch(() => speakWithVoice(word));
  }, [play, speakWithVoice]);

  const speak = speakWithVoice;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const narrate = useMemo(() => createNarration(playNarration, speak), [playNarration, speak]);

  return { play, playPhoneme, playNarration, playWord, speak, stop, narrate };
}
