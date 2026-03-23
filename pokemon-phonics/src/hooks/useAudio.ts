'use client';

import { useCallback, useRef, useMemo, useEffect } from 'react';
import { createNarration } from '@/lib/narrate';
import { getChiptuneEngine } from '@/lib/chiptune';

/**
 * Find the best English voice available on this device.
 * Prefers en-US, then en-GB, then any en-* voice.
 * Returns null if no English voice found (will fall back to lang attribute).
 */
function findEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
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

/**
 * Duck music volume while narration/speech plays, then restore.
 * iOS Safari shares a single audio session — music + speech fight.
 */
function duckMusic() {
  const engine = getChiptuneEngine();
  const prevVolume = engine.volume;
  engine.volume = prevVolume * 0.15; // duck to 15%
  return () => { engine.volume = prevVolume; };
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

    // iOS Safari workaround: periodically ping speechSynthesis to prevent freeze.
    const keepAlive = setInterval(() => {
      if (speechSynthesis.speaking) {
        speechSynthesis.pause();
        speechSynthesis.resume();
      }
    }, 5000);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      clearInterval(keepAlive);
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }, []);

  const play = useCallback((path: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      stop();
      const unduck = duckMusic();
      const audio = new Audio(path);
      audioRef.current = audio;
      audio.onended = () => { unduck(); resolve(); };
      audio.onerror = () => { unduck(); reject(new Error(`Failed to play: ${path}`)); };
      audio.play().catch((err) => { unduck(); reject(err); });
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
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      // iOS Safari fix: cancel any stuck queue before speaking
      speechSynthesis.cancel();

      const unduck = duckMusic();
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          unduck();
          resolve();
        }
      };

      // Small delay after cancel — iOS needs a tick to process it
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1.1;
        if (englishVoiceRef.current) {
          utterance.voice = englishVoiceRef.current;
        }
        utterance.onend = done;
        utterance.onerror = done;
        // Safety timeout — iOS sometimes never fires onend
        setTimeout(done, 5000);
        speechSynthesis.speak(utterance);
      }, 50);
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
