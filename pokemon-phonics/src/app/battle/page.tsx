'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { useMusic } from '@/hooks/useMusic';
import { getPhonemesBySet } from '@/data/phonemes';
import { getRegionById } from '@/data/regions';
import { getGymLeader } from '@/data/gym-leaders';
import { generateBattleWords, BattleWord } from '@/lib/battle-gen';
import PokemonSprite from '@/components/PokemonSprite';
import LetterCard from '@/components/LetterCard';
import './battle.css';

type BattlePhase =
  | 'entrance'
  | 'intro'
  | 'battle'
  | 'attack-result'
  | 'victory'
  | 'badge';

function BattleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gymId = parseInt(searchParams.get('gym') || '1');
  const { state, loaded, earnBadge, addAttempt } = useGameState();
  const { speak, playPhoneme, playWord } = useAudio();
  useMusic('battle');

  const region = getRegionById(gymId);
  const leader = getGymLeader(gymId);

  const [phase, setPhase] = useState<BattlePhase>('entrance');
  const [battleWords, setBattleWords] = useState<BattleWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [leaderHp, setLeaderHp] = useState(leader?.hp || 5);
  const [maxHp] = useState(leader?.hp || 5);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerCorrectness, setAnswerCorrectness] = useState<Record<string, boolean | null>>({});
  const [attackResult, setAttackResult] = useState<'hit' | 'miss' | null>(null);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const challengeStartTime = useRef<number>(0);

  // Initialize battle
  useEffect(() => {
    if (!loaded || !state || !region || !leader) return;
    const words = generateBattleWords(region.set, leader.hp);
    setBattleWords(words);
    setLeaderHp(leader.hp);
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Entrance animation
  useEffect(() => {
    if (phase === 'entrance' && region) {
      speak(`Welcome to ${region.name} Gym!`).then(() => {
        setTimeout(() => setPhase('intro'), 500);
      });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Intro — leader speaks
  useEffect(() => {
    if (phase === 'intro' && leader) {
      setTimeout(() => {
        speak(leader.greeting).then(() => {
          setTimeout(() => {
            setPhase('battle');
            challengeStartTime.current = Date.now();
          }, 500);
        });
      }, 800);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-narrate each battle word
  useEffect(() => {
    if (phase === 'battle' && battleWords[currentWordIndex]) {
      const word = battleWords[currentWordIndex];
      setTimeout(() => {
        speak(`The gym leader used ${word.correctWord} attack! Can you read it?`);
      }, 300);
    }
  }, [phase, currentWordIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Attack result display
  useEffect(() => {
    if (phase !== 'attack-result') return;
    const timer = setTimeout(() => {
      if (leaderHp <= 0) {
        setPhase('victory');
      } else {
        setSelectedAnswer(null);
        setAnswerCorrectness({});
        setAttackResult(null);
        setCurrentWordIndex(prev => prev + 1);
        setPhase('battle');
        challengeStartTime.current = Date.now();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase, leaderHp]);

  // Victory
  useEffect(() => {
    if (phase === 'victory' && leader && state) {
      speak(leader.defeat).then(() => {
        setTimeout(() => {
          if (!state.badges.includes(`gym-${gymId}`)) {
            earnBadge(`gym-${gymId}`);
          }
          setPhase('badge');
          setShowBadge(true);
        }, 500);
      });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Badge narration
  useEffect(() => {
    if (phase === 'badge' && region && state) {
      setTimeout(() => {
        speak(`${state.playerName || 'Trainer'} earned the ${region.badgeName}!`).then(() => {
          const nextRegion = getRegionById(gymId + 1);
          if (nextRegion) {
            speak(`A new area has been discovered! ${nextRegion.name} is now open!`);
          }
        });
      }, 1500);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback((word: string, isCorrect: boolean) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(word);
    setAnswerCorrectness({ [word]: isCorrect });

    const currentWord = battleWords[currentWordIndex];
    if (!currentWord) return;

    const responseTimeMs = Date.now() - challengeStartTime.current;

    // Record attempt for each phoneme in the word
    currentWord.word.phonemes.forEach(phonemeId => {
      addAttempt(phonemeId, {
        correct: isCorrect,
        timestamp: Date.now(),
        responseTimeMs,
        challengeType: 'battle',
      });
    });

    if (isCorrect) {
      setConsecutiveWrong(0);
      setLeaderHp(prev => prev - 1);
      setAttackResult('hit');
      speak("It's super effective!").then(() => {
        setPhase('attack-result');
      });
    } else {
      setConsecutiveWrong(prev => prev + 1);
      setAttackResult('miss');
      if (consecutiveWrong >= 2) {
        speak("The attack missed! But you're doing great! Let's try the next one.").then(() => {
          // After 3 wrong in a row, reduce leader HP anyway to prevent frustration
          setLeaderHp(prev => prev - 1);
          setPhase('attack-result');
        });
      } else {
        speak('The attack missed!').then(() => {
          setPhase('attack-result');
        });
      }
    }
  }, [selectedAnswer, battleWords, currentWordIndex, addAttempt, speak, consecutiveWrong]);

  const handlePlaySound = useCallback((phonemeId: string) => {
    playPhoneme(phonemeId).catch(() => speak(phonemeId));
  }, [playPhoneme, speak]);

  const handlePlayWord = useCallback((word: string) => {
    playWord(word).catch(() => speak(word));
  }, [playWord, speak]);

  if (!loaded || !state || !region || !leader) {
    return <div className="screen"><p>Loading...</p></div>;
  }

  // Check prerequisites: all Pokemon in this region caught
  const regionPhonemes = getPhonemesBySet(region.set);
  const allCaught = regionPhonemes.every(p => state.pokemon[p.id]?.caught);
  const alreadyBeat = state.badges.includes(`gym-${gymId}`);

  if (!allCaught && !alreadyBeat) {
    return (
      <div className="screen battle-screen">
        <div className="battle-locked fade-in">
          <PokemonSprite pokedexId={leader.pokemonId} name={leader.pokemonName} size={120} />
          <h2>Gym locked!</h2>
          <p>Catch all {regionPhonemes.length} Pokemon in {region.name} to challenge the gym!</p>
          <p className="battle-locked-progress">
            {regionPhonemes.filter(p => state.pokemon[p.id]?.caught).length} / {regionPhonemes.length} caught
          </p>
          <button className="btn btn-secondary" onClick={() => router.push('/map')}>
            Back to map
          </button>
        </div>
      </div>
    );
  }

  const currentWord = battleWords[currentWordIndex];

  return (
    <div className="screen battle-screen">
      {/* Gym Entrance */}
      {phase === 'entrance' && (
        <div className="battle-entrance fade-in">
          <div className="gym-building bounce-in">
            <div className="gym-roof" style={{ borderBottomColor: region.badgeColor }} />
            <div className="gym-body">
              <div className="gym-door" />
            </div>
            <div className="gym-sign">{region.name} Gym</div>
          </div>
        </div>
      )}

      {/* Leader Introduction */}
      {phase === 'intro' && (
        <div className="battle-intro fade-in">
          <div className="leader-sprite bounce-in">
            <PokemonSprite
              pokedexId={leader.pokemonId}
              name={leader.pokemonName}
              size={160}
            />
          </div>
          <h2 className="leader-name slide-up">{leader.name}</h2>
          <p className="leader-title">{leader.title}</p>
          <p className="leader-dialogue slide-up">&ldquo;{leader.greeting}&rdquo;</p>
        </div>
      )}

      {/* Battle Phase */}
      {phase === 'battle' && currentWord && (
        <div className="battle-arena fade-in">
          {/* HP Bar */}
          <div className="battle-hud">
            <div className="hud-leader">
              <PokemonSprite
                pokedexId={leader.pokemonId}
                name={leader.pokemonName}
                size={48}
              />
              <div className="hud-info">
                <span className="hud-name">{leader.name}</span>
                <div className="hp-bar">
                  <div
                    className="hp-fill"
                    style={{ width: `${(leaderHp / maxHp) * 100}%` }}
                  />
                </div>
                <span className="hp-text">HP {leaderHp}/{maxHp}</span>
              </div>
            </div>
            <span className="battle-turn">Turn {currentWordIndex + 1}</span>
          </div>

          {/* Word Challenge */}
          <div className="battle-word-area">
            <p className="battle-prompt">
              {leader.name} used <strong>{currentWord.correctWord.toUpperCase()}</strong> attack!
            </p>

            <div className="battle-word-display">
              {currentWord.letters.map((letter, i) => (
                <LetterCard
                  key={`${letter}-${i}`}
                  grapheme={letter}
                  size="medium"
                  onClick={() => handlePlaySound(letter)}
                />
              ))}
            </div>

            <p className="battle-hint">Tap each letter to hear its sound, then pick the word!</p>

            <div className="battle-options">
              {currentWord.options.map(opt => (
                <button
                  key={opt.word}
                  className={`btn btn-battle-option ${
                    answerCorrectness[opt.word] === true ? 'btn-correct' :
                    answerCorrectness[opt.word] === false ? 'btn-wrong' : ''
                  }`}
                  disabled={selectedAnswer !== null}
                  onClick={() => {
                    handlePlayWord(opt.word);
                    setTimeout(() => {
                      handleAnswer(opt.word, opt.word === currentWord.correctWord);
                    }, 800);
                  }}
                >
                  <span className="sound-icon">&#x1F50A;</span>
                  <span>{opt.word}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Attack Result */}
      {phase === 'attack-result' && (
        <div className="battle-result fade-in">
          {attackResult === 'hit' ? (
            <>
              <div className="result-effect super-effective">
                <div className="hit-flash" />
              </div>
              <h2 className="result-text result-hit bounce-in">
                It&apos;s super effective!
              </h2>
              <p className="result-hp">Leader HP: {leaderHp}/{maxHp}</p>
            </>
          ) : (
            <>
              <h2 className="result-text result-miss slide-up">
                The attack missed!
              </h2>
              {consecutiveWrong >= 2 && (
                <p className="result-encourage">Don&apos;t worry, you&apos;re doing great!</p>
              )}
            </>
          )}
        </div>
      )}

      {/* Victory */}
      {phase === 'victory' && (
        <div className="battle-victory fade-in">
          <div className="leader-defeated">
            <PokemonSprite
              pokedexId={leader.pokemonId}
              name={leader.pokemonName}
              size={120}
              className="defeated-sprite"
            />
          </div>
          <h2 className="victory-text bounce-in">You beat {leader.name}!</h2>
        </div>
      )}

      {/* Badge Award */}
      {phase === 'badge' && (
        <div className="battle-badge fade-in">
          <div className={`badge-award ${showBadge ? 'badge-animate' : ''}`}>
            <div className="badge-icon" style={{ backgroundColor: region.badgeColor }}>
              ★
            </div>
          </div>
          <h2 className="badge-text slide-up">{region.badgeName}</h2>
          <p className="badge-subtext">
            {state.playerName || 'Trainer'} earned the {region.badgeName}!
          </p>

          {/* Stars */}
          <div className="stars">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="star"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.8}s`,
                  animationDuration: `${0.8 + Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>

          <div className="badge-buttons">
            <button className="btn btn-primary" onClick={() => router.push('/map')}>
              Back to map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BattlePage() {
  return (
    <Suspense fallback={<div className="screen"><p>Loading...</p></div>}>
      <BattleContent />
    </Suspense>
  );
}
