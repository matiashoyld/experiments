'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useGameState, PokemonState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { useMusic } from '@/hooks/useMusic';
import { PhonemeData, ALL_PHONEMES, getPhonemeById } from '@/data/phonemes';
import PokemonSprite from '@/components/PokemonSprite';
import LetterCard from '@/components/LetterCard';
import ProgressBar from '@/components/ProgressBar';
import { EVOLUTION_XP, getEvolutionStage, isShinyEligible } from '@/lib/mastery';
import { generateTrainingSession, TrainingExercise } from '@/lib/training-gen';
import './train.css';

type TrainPhase = 'select' | 'intro' | 'exercise' | 'result' | 'evolving' | 'shiny' | 'summary';

function TrainContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pokemonParam = searchParams.get('pokemon');
  const { state, loaded, addAttempt, evolvePokemon, updateState } = useGameState();
  const { speak, playPhoneme, playWord, stop, narrate } = useAudio();
  useMusic('training');

  const [phase, setPhase] = useState<TrainPhase>(pokemonParam ? 'intro' : 'select');
  const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeData | null>(null);
  const [exercises, setExercises] = useState<TrainingExercise[]>([]);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerCorrectness, setAnswerCorrectness] = useState<Record<string, boolean | null>>({});
  const [xpGained, setXpGained] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [pendingEvolution, setPendingEvolution] = useState<{ from: number; to: number; fromName: string; toName: string } | null>(null);
  const [pendingShiny, setPendingShiny] = useState(false);
  const [buildSlots, setBuildSlots] = useState<(string | null)[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{ letter: string; used: boolean }[]>([]);
  const challengeStartTime = useRef<number>(0);

  // Initialize from query param
  useEffect(() => {
    if (!loaded || !state || !pokemonParam) return;
    const phoneme = getPhonemeById(pokemonParam);
    if (phoneme && state.pokemon[phoneme.id]?.caught) {
      setSelectedPhoneme(phoneme);
      const pokemonState = state.pokemon[phoneme.id];
      const stage = pokemonState?.stage || 1;
      const session = generateTrainingSession(phoneme, stage, state.currentSet);
      setExercises(session);
      setPhase('intro');
    } else {
      setPhase('select');
    }
  }, [loaded, pokemonParam]); // eslint-disable-line react-hooks/exhaustive-deps

  // Intro narration
  useEffect(() => {
    if (phase === 'intro' && selectedPhoneme) {
      const pokemonState = state?.pokemon[selectedPhoneme.id];
      const stage = pokemonState?.stage || 1;
      const evoLine = selectedPhoneme.pokemon.evolutionLine;
      const currentPokemon = stage === 3 ? evoLine.stage3 : stage === 2 ? evoLine.stage2 : evoLine.stage1;
      narrate.training.intro(currentPokemon.name).then(() => {
        setTimeout(() => {
          setPhase('exercise');
          challengeStartTime.current = Date.now();
        }, 500);
      });
    }
  }, [phase, selectedPhoneme]); // eslint-disable-line react-hooks/exhaustive-deps

  // Init build slots for Exercise C
  useEffect(() => {
    if (phase === 'exercise' && exercises[currentExIndex]?.type === 'C') {
      const ex = exercises[currentExIndex] as TrainingExercise & { type: 'C' };
      setBuildSlots(new Array(ex.correctOrder.length).fill(null));
      setAvailableLetters(ex.letters.map(l => ({ letter: l, used: false })));
    }
  }, [phase, currentExIndex, exercises]);

  // Auto-play sounds for exercise types
  useEffect(() => {
    if (phase !== 'exercise' || !exercises[currentExIndex]) return;
    const ex = exercises[currentExIndex];
    if (ex.type === 'A') {
      // Play the phoneme sound
      setTimeout(() => {
        playPhoneme(ex.correctPhonemeId).catch(() => speak(ex.correctGrapheme));
      }, 400);
    }
    if (ex.type === 'C') {
      // Speak the target word
      setTimeout(() => {
        playWord(ex.targetWord).catch(() => speak(ex.targetWord));
      }, 400);
    }
    if (ex.type === 'E') {
      // Speak the target word for matching
      setTimeout(() => {
        playWord(ex.targetWord).catch(() => speak(ex.targetWord));
      }, 400);
    }
  }, [phase, currentExIndex, exercises]); // eslint-disable-line react-hooks/exhaustive-deps

  // Evolution animation
  useEffect(() => {
    if (phase === 'evolving' && pendingEvolution && selectedPhoneme) {
      const currentStage = state?.pokemon[selectedPhoneme.id]?.stage || 1;
      const evoStartFn = currentStage === 1 ? narrate.evolution.start : narrate.evolution.start2;
      evoStartFn(selectedPhoneme.id, pendingEvolution.fromName).then(() => {
        setTimeout(() => {
          const newStage = getEvolutionStage(state?.pokemon[selectedPhoneme.id]?.xp || 0);
          evolvePokemon(selectedPhoneme.id, newStage);
          narrate.evolution.complete(selectedPhoneme.id, newStage, pendingEvolution.fromName, pendingEvolution.toName).then(() => {
            setTimeout(() => {
              setPendingEvolution(null);
              if (pendingShiny) {
                setPhase('shiny');
              } else {
                advanceOrEnd();
              }
            }, 1500);
          });
        }, 2500);
      });
    }
  }, [phase, pendingEvolution]); // eslint-disable-line react-hooks/exhaustive-deps

  // Shiny animation
  useEffect(() => {
    if (phase === 'shiny' && selectedPhoneme) {
      narrate.training.shiny(selectedPhoneme.pokemon.name).then(() => {
        updateState(prev => {
          const pokemon = { ...prev.pokemon };
          const current = pokemon[selectedPhoneme.id];
          if (current) {
            pokemon[selectedPhoneme.id] = { ...current, isShiny: true };
          }
          return { ...prev, pokemon };
        });
        setTimeout(() => {
          setPendingShiny(false);
          advanceOrEnd();
        }, 2000);
      });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceOrEnd = useCallback(() => {
    if (currentExIndex + 1 < exercises.length) {
      setCurrentExIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerCorrectness({});
      setPhase('exercise');
      challengeStartTime.current = Date.now();
    } else {
      setPhase('summary');
    }
  }, [currentExIndex, exercises.length]);

  const handleSelectPokemon = useCallback((phoneme: PhonemeData) => {
    setSelectedPhoneme(phoneme);
    const pokemonState = state?.pokemon[phoneme.id];
    const stage = pokemonState?.stage || 1;
    const session = generateTrainingSession(phoneme, stage, state?.currentSet || 1);
    setExercises(session);
    setCurrentExIndex(0);
    setXpGained(0);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setAnswerCorrectness({});
    setPhase('intro');
  }, [state]);

  const handleAnswer = useCallback((answerId: string, isCorrect: boolean) => {
    if (selectedAnswer !== null || !selectedPhoneme || !state) return;

    setSelectedAnswer(answerId);
    const responseTimeMs = Date.now() - challengeStartTime.current;
    setAnswerCorrectness({ [answerId]: isCorrect });

    addAttempt(selectedPhoneme.id, {
      correct: isCorrect,
      timestamp: Date.now(),
      responseTimeMs,
      challengeType: `train-${exercises[currentExIndex]?.type || 'A'}`,
    });

    if (isCorrect) {
      setXpGained(prev => prev + 1);
      setCorrectCount(prev => prev + 1);

      // Check for evolution
      const pokemonState = state.pokemon[selectedPhoneme.id];
      const currentXp = (pokemonState?.xp || 0) + 1; // +1 for this correct answer (addAttempt already adds)
      const currentStage = pokemonState?.stage || 1;
      const newStage = getEvolutionStage(currentXp);

      // Check for shiny
      const attempts = [...(pokemonState?.attempts || []), { correct: true, timestamp: Date.now(), responseTimeMs, challengeType: '' }];
      const shinyNow = !pokemonState?.isShiny && isShinyEligible(attempts);

      narrate.training.correct().then(() => {
        setTimeout(() => {
          if (newStage > currentStage) {
            const evoLine = selectedPhoneme.pokemon.evolutionLine;
            const fromPokemon = currentStage === 1 ? evoLine.stage1 : evoLine.stage2;
            const toPokemon = newStage === 2 ? evoLine.stage2 : evoLine.stage3;
            setPendingEvolution({ from: fromPokemon.id, to: toPokemon.id, fromName: fromPokemon.name, toName: toPokemon.name });
            setPendingShiny(shinyNow);
            setPhase('evolving');
          } else if (shinyNow) {
            setPendingShiny(true);
            setPhase('shiny');
          } else {
            advanceOrEnd();
          }
        }, 500);
      });
    } else {
      narrate.training.almost().then(() => {
        setTimeout(() => advanceOrEnd(), 800);
      });
    }
  }, [selectedAnswer, selectedPhoneme, state, exercises, currentExIndex, addAttempt, speak, advanceOrEnd]);

  const handlePlaySound = useCallback((phonemeId: string) => {
    playPhoneme(phonemeId).catch(() => {
      const phoneme = getPhonemeById(phonemeId);
      if (phoneme) speak(phoneme.displayGrapheme);
    });
  }, [playPhoneme, speak]);

  const handlePlayWord = useCallback((word: string) => {
    playWord(word).catch(() => speak(word));
  }, [playWord, speak]);

  // Exercise C: tap letter to place in slot
  const handleBuildLetter = useCallback((letterIndex: number) => {
    const ex = exercises[currentExIndex];
    if (ex?.type !== 'C') return;

    setAvailableLetters(prev => {
      const updated = [...prev];
      updated[letterIndex] = { ...updated[letterIndex], used: true };
      return updated;
    });

    setBuildSlots(prev => {
      const updated = [...prev];
      const nextEmpty = updated.indexOf(null);
      if (nextEmpty !== -1) {
        updated[nextEmpty] = availableLetters[letterIndex].letter;
      }

      // Check if word is complete
      const allFilled = updated.every(s => s !== null);
      if (allFilled) {
        const built = updated.join('');
        const correct = built === (ex as TrainingExercise & { type: 'C' }).targetWord;
        setTimeout(() => handleAnswer(built, correct), 300);
      }
      return updated;
    });
  }, [exercises, currentExIndex, availableLetters, handleAnswer]);

  // Exercise C: undo last letter
  const handleUndoBuild = useCallback(() => {
    setBuildSlots(prev => {
      const updated = [...prev];
      let lastFilled = -1;
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i] !== null) { lastFilled = i; break; }
      }
      if (lastFilled === -1) return prev;

      const removedLetter = updated[lastFilled];
      updated[lastFilled] = null;

      // Un-use the letter
      setAvailableLetters(prev2 => {
        const updated2 = [...prev2];
        for (let i = updated2.length - 1; i >= 0; i--) {
          if (updated2[i].used && updated2[i].letter === removedLetter) {
            updated2[i] = { ...updated2[i], used: false };
            break;
          }
        }
        return updated2;
      });

      return updated;
    });
  }, []);

  if (!loaded || !state) {
    return <div className="screen"><p>Loading...</p></div>;
  }

  // Get caught Pokemon for selection
  const caughtPokemon = ALL_PHONEMES.filter(p => state.pokemon[p.id]?.caught);

  // Current Pokemon display info
  const pokemonState = selectedPhoneme ? state.pokemon[selectedPhoneme.id] : undefined;
  const stage = pokemonState?.stage || 1;
  const evoLine = selectedPhoneme?.pokemon.evolutionLine;
  const currentDisplay = evoLine
    ? (stage === 3 ? evoLine.stage3 : stage === 2 ? evoLine.stage2 : evoLine.stage1)
    : null;

  const currentXp = pokemonState?.xp || 0;
  const xpToNextStage = stage === 1 ? EVOLUTION_XP.stage2 : stage === 2 ? EVOLUTION_XP.stage2 + EVOLUTION_XP.stage3 : EVOLUTION_XP.stage2 + EVOLUTION_XP.stage3;
  const xpProgress = stage === 3 ? 1 : currentXp / xpToNextStage;

  return (
    <div className="screen train-screen">
      {/* Pokemon Selection */}
      {phase === 'select' && (
        <div className="train-select fade-in">
          <div className="train-header">
            <button className="btn btn-secondary" onClick={() => router.push('/map')}>
              ← Map
            </button>
            <h2>Choose a Pokemon to train!</h2>
          </div>

          {caughtPokemon.length === 0 ? (
            <div className="train-empty">
              <p>You haven&apos;t caught any Pokemon yet!</p>
              <button className="btn btn-primary" onClick={() => router.push('/map')}>
                Go explore!
              </button>
            </div>
          ) : (
            <div className="train-grid">
              {caughtPokemon.map(phoneme => {
                const pState = state.pokemon[phoneme.id];
                const pStage = pState?.stage || 1;
                const pEvo = phoneme.pokemon.evolutionLine;
                const pDisplay = pStage === 3 ? pEvo.stage3 : pStage === 2 ? pEvo.stage2 : pEvo.stage1;
                const pXp = pState?.xp || 0;
                const pNextXp = pStage === 1 ? EVOLUTION_XP.stage2 : pStage === 2 ? EVOLUTION_XP.stage2 + EVOLUTION_XP.stage3 : EVOLUTION_XP.stage2 + EVOLUTION_XP.stage3;
                const pProgress = pStage === 3 ? 1 : pXp / pNextXp;
                const nearEvolution = pProgress >= 0.8 && pStage < 3;

                return (
                  <button
                    key={phoneme.id}
                    className={`train-pokemon-card ${nearEvolution ? 'near-evolution' : ''}`}
                    onClick={() => handleSelectPokemon(phoneme)}
                  >
                    <PokemonSprite
                      pokedexId={pDisplay.id}
                      name={pDisplay.name}
                      size={72}
                      variant={pState?.isShiny ? 'shiny' : 'animated'}
                    />
                    <span className="train-pokemon-name">{pDisplay.name}</span>
                    <span className="train-pokemon-sound">{phoneme.displayGrapheme}</span>
                    <div className="train-pokemon-xp">
                      <ProgressBar
                        value={pProgress}
                        height={8}
                        color={nearEvolution ? '#FFD700' : '#4CAF50'}
                      />
                    </div>
                    {nearEvolution && <span className="evolution-glow-badge">Almost evolving!</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Training Intro */}
      {phase === 'intro' && selectedPhoneme && currentDisplay && (
        <div className="train-intro fade-in">
          <div className="bounce-in">
            <PokemonSprite
              pokedexId={currentDisplay.id}
              name={currentDisplay.name}
              size={180}
              variant={pokemonState?.isShiny ? 'shiny' : 'animated'}
            />
          </div>
          <h2 className="train-intro-text slide-up">
            Let&apos;s train {currentDisplay.name}!
          </h2>
          <div className="train-intro-xp slide-up">
            <ProgressBar
              value={xpProgress}
              label="XP"
              height={16}
              color="#FFD700"
              showPercentage
            />
          </div>
        </div>
      )}

      {/* Exercise Phase */}
      {phase === 'exercise' && exercises[currentExIndex] && selectedPhoneme && currentDisplay && (
        <div className="train-exercise fade-in">
          <div className="train-exercise-header">
            <div className="train-exercise-pokemon">
              <PokemonSprite
                pokedexId={currentDisplay.id}
                name={currentDisplay.name}
                size={80}
                variant={pokemonState?.isShiny ? 'shiny' : 'animated'}
              />
            </div>
            <div className="train-exercise-progress">
              <span className="train-exercise-count">
                {currentExIndex + 1} / {exercises.length}
              </span>
              <ProgressBar
                value={(currentExIndex) / exercises.length}
                height={8}
                color="#4CAF50"
              />
            </div>
          </div>

          <div className="train-exercise-content">
            {exercises[currentExIndex].type === 'A' && (
              <ExerciseA
                exercise={exercises[currentExIndex] as TrainingExercise & { type: 'A' }}
                onAnswer={handleAnswer}
                onReplaySound={() => handlePlaySound((exercises[currentExIndex] as TrainingExercise & { type: 'A' }).correctPhonemeId)}
                selectedAnswer={selectedAnswer}
                answerCorrectness={answerCorrectness}
              />
            )}
            {exercises[currentExIndex].type === 'B' && (
              <ExerciseB
                exercise={exercises[currentExIndex] as TrainingExercise & { type: 'B' }}
                onAnswer={handleAnswer}
                onPlaySound={handlePlaySound}
                selectedAnswer={selectedAnswer}
                answerCorrectness={answerCorrectness}
              />
            )}
            {exercises[currentExIndex].type === 'C' && (
              <ExerciseC
                exercise={exercises[currentExIndex] as TrainingExercise & { type: 'C' }}
                buildSlots={buildSlots}
                availableLetters={availableLetters}
                onTapLetter={handleBuildLetter}
                onUndo={handleUndoBuild}
                onReplayWord={() => handlePlayWord((exercises[currentExIndex] as TrainingExercise & { type: 'C' }).targetWord)}
                selectedAnswer={selectedAnswer}
              />
            )}
            {exercises[currentExIndex].type === 'D' && (
              <ExerciseD
                exercise={exercises[currentExIndex] as TrainingExercise & { type: 'D' }}
                onAnswer={handleAnswer}
                onPlaySound={handlePlaySound}
                onPlayWord={handlePlayWord}
                selectedAnswer={selectedAnswer}
                answerCorrectness={answerCorrectness}
              />
            )}
            {exercises[currentExIndex].type === 'E' && (
              <ExerciseE
                exercise={exercises[currentExIndex] as TrainingExercise & { type: 'E' }}
                onAnswer={handleAnswer}
                onReplayWord={() => handlePlayWord((exercises[currentExIndex] as TrainingExercise & { type: 'E' }).targetWord)}
                selectedAnswer={selectedAnswer}
                answerCorrectness={answerCorrectness}
              />
            )}
          </div>
        </div>
      )}

      {/* Evolution Animation */}
      {phase === 'evolving' && pendingEvolution && (
        <div className="train-evolving fade-in">
          <h2 className="evolving-title">What?</h2>
          <div className="evolving-scene">
            <div className="evolving-pokemon evolving-glow">
              <PokemonSprite
                pokedexId={pendingEvolution.from}
                name={pendingEvolution.fromName}
                size={180}
                variant="animated"
                className="evolving-sprite-from"
              />
            </div>
            <div className="evolving-pokemon evolving-reveal">
              <PokemonSprite
                pokedexId={pendingEvolution.to}
                name={pendingEvolution.toName}
                size={200}
                variant="animated"
                className="evolving-sprite-to"
              />
            </div>
          </div>
          <h2 className="evolving-subtitle slide-up">
            {pendingEvolution.fromName} is evolving!
          </h2>
        </div>
      )}

      {/* Shiny Animation */}
      {phase === 'shiny' && selectedPhoneme && currentDisplay && (
        <div className="train-shiny fade-in">
          <div className="shiny-sparkle">
            <PokemonSprite
              pokedexId={currentDisplay.id}
              name={currentDisplay.name}
              size={200}
              variant="shiny"
            />
          </div>
          <h2 className="shiny-title">Sparkling!</h2>
          <p className="shiny-text">{currentDisplay.name} became a shiny Pokemon!</p>
          {/* Star confetti */}
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
        </div>
      )}

      {/* Training Summary */}
      {phase === 'summary' && selectedPhoneme && currentDisplay && (
        <div className="train-summary fade-in">
          <div className="bounce-in">
            <PokemonSprite
              pokedexId={currentDisplay.id}
              name={currentDisplay.name}
              size={160}
              variant={pokemonState?.isShiny ? 'shiny' : 'animated'}
            />
          </div>
          <h2 className="summary-title slide-up">Great training session!</h2>
          <p className="summary-subtitle">{currentDisplay.name} is getting stronger!</p>

          <div className="summary-stats slide-up">
            <div className="summary-stat">
              <span className="summary-stat-value">{correctCount}</span>
              <span className="summary-stat-label">Correct</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat-value">{exercises.length}</span>
              <span className="summary-stat-label">Total</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat-value">+{xpGained}</span>
              <span className="summary-stat-label">XP</span>
            </div>
          </div>

          <div className="summary-xp slide-up">
            <ProgressBar
              value={stage === 3 ? 1 : (pokemonState?.xp || 0) / xpToNextStage}
              label="XP"
              height={20}
              color="#FFD700"
              showPercentage
            />
          </div>

          <div className="summary-buttons">
            <button className="btn btn-primary" onClick={() => {
              setPhase('select');
              setSelectedPhoneme(null);
              setExercises([]);
              setCurrentExIndex(0);
              setXpGained(0);
              setCorrectCount(0);
            }}>
              Train another
            </button>
            <button className="btn btn-secondary" onClick={() => router.push('/map')}>
              Back to map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// === Exercise Components ===

function ExerciseA({
  exercise,
  onAnswer,
  onReplaySound,
  selectedAnswer,
  answerCorrectness,
}: {
  exercise: TrainingExercise & { type: 'A' };
  onAnswer: (id: string, correct: boolean) => void;
  onReplaySound: () => void;
  selectedAnswer: string | null;
  answerCorrectness: Record<string, boolean | null>;
}) {
  return (
    <>
      <p className="exercise-prompt">{exercise.prompt}</p>
      <button className="btn btn-secondary replay-btn" onClick={onReplaySound}>
        <span className="sound-icon">&#x1F50A;</span> Hear the sound
      </button>
      <div className="exercise-options-letters">
        {exercise.options.map(opt => (
          <LetterCard
            key={opt.phonemeId}
            grapheme={opt.grapheme}
            size="medium"
            correct={answerCorrectness[opt.phonemeId] ?? null}
            disabled={selectedAnswer !== null}
            onClick={() => onAnswer(opt.phonemeId, opt.phonemeId === exercise.correctPhonemeId)}
          />
        ))}
      </div>
    </>
  );
}

function ExerciseB({
  exercise,
  onAnswer,
  onPlaySound,
  selectedAnswer,
  answerCorrectness,
}: {
  exercise: TrainingExercise & { type: 'B' };
  onAnswer: (id: string, correct: boolean) => void;
  onPlaySound: (id: string) => void;
  selectedAnswer: string | null;
  answerCorrectness: Record<string, boolean | null>;
}) {
  return (
    <>
      <p className="exercise-prompt">{exercise.prompt}</p>
      <div className="exercise-grapheme-display">
        <LetterCard grapheme={exercise.grapheme} size="large" />
      </div>
      <div className="exercise-options">
        {exercise.options.map(opt => (
          <button
            key={opt.phonemeId}
            className={`btn btn-sound-option ${
              answerCorrectness[opt.phonemeId] === true ? 'btn-correct' :
              answerCorrectness[opt.phonemeId] === false ? 'btn-wrong' : ''
            }`}
            disabled={selectedAnswer !== null}
            onClick={() => {
              onPlaySound(opt.phonemeId);
              setTimeout(() => {
                onAnswer(opt.phonemeId, opt.phonemeId === exercise.correctPhonemeId);
              }, 600);
            }}
          >
            <span className="sound-icon">&#x1F50A;</span>
            <span className="sound-label">{opt.grapheme}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function ExerciseC({
  exercise,
  buildSlots,
  availableLetters,
  onTapLetter,
  onUndo,
  onReplayWord,
  selectedAnswer,
}: {
  exercise: TrainingExercise & { type: 'C' };
  buildSlots: (string | null)[];
  availableLetters: { letter: string; used: boolean }[];
  onTapLetter: (index: number) => void;
  onUndo: () => void;
  onReplayWord: () => void;
  selectedAnswer: string | null;
}) {
  const isComplete = buildSlots.every(s => s !== null);
  const isCorrect = isComplete && buildSlots.join('') === exercise.targetWord;
  const isWrong = isComplete && !isCorrect;

  return (
    <>
      <p className="exercise-prompt">{exercise.prompt}</p>
      <button className="btn btn-secondary replay-btn" onClick={onReplayWord}>
        <span className="sound-icon">&#x1F50A;</span> Hear the word
      </button>

      {/* Build slots */}
      <div className="build-slots">
        {buildSlots.map((slot, i) => (
          <div key={i} className={`build-slot ${slot ? 'filled' : 'empty'} ${isCorrect ? 'slot-correct' : ''} ${isWrong ? 'slot-wrong' : ''}`}>
            {slot || ''}
          </div>
        ))}
      </div>

      {/* Available letters */}
      <div className="build-letters">
        {availableLetters.map((item, i) => (
          <LetterCard
            key={`${item.letter}-${i}`}
            grapheme={item.letter}
            size="medium"
            disabled={item.used || selectedAnswer !== null}
            selected={item.used}
            onClick={() => !item.used && onTapLetter(i)}
          />
        ))}
      </div>

      {buildSlots.some(s => s !== null) && !isComplete && (
        <button className="btn btn-secondary" onClick={onUndo} style={{ marginTop: 8 }}>
          Undo
        </button>
      )}
    </>
  );
}

function ExerciseD({
  exercise,
  onAnswer,
  onPlaySound,
  onPlayWord,
  selectedAnswer,
  answerCorrectness,
}: {
  exercise: TrainingExercise & { type: 'D' };
  onAnswer: (id: string, correct: boolean) => void;
  onPlaySound: (id: string) => void;
  onPlayWord: (word: string) => void;
  selectedAnswer: string | null;
  answerCorrectness: Record<string, boolean | null>;
}) {
  return (
    <>
      <p className="exercise-prompt">{exercise.prompt}</p>
      <div className="exercise-word-display">
        {exercise.letters.map((letter, i) => (
          <LetterCard
            key={`${letter}-${i}`}
            grapheme={letter}
            size="medium"
            onClick={() => onPlaySound(letter)}
          />
        ))}
      </div>
      <p className="exercise-hint-text">Tap each letter to hear its sound!</p>
      <div className="exercise-options">
        {exercise.options.map(opt => (
          <button
            key={opt.word}
            className={`btn btn-sound-option ${
              answerCorrectness[opt.word] === true ? 'btn-correct' :
              answerCorrectness[opt.word] === false ? 'btn-wrong' : ''
            }`}
            disabled={selectedAnswer !== null}
            onClick={() => {
              onPlayWord(opt.word);
              setTimeout(() => {
                onAnswer(opt.word, opt.word === exercise.correctWord);
              }, 800);
            }}
          >
            <span className="sound-icon">&#x1F50A;</span>
            <span className="sound-label">{opt.word}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function ExerciseE({
  exercise,
  onAnswer,
  onReplayWord,
  selectedAnswer,
  answerCorrectness,
}: {
  exercise: TrainingExercise & { type: 'E' };
  onAnswer: (id: string, correct: boolean) => void;
  onReplayWord: () => void;
  selectedAnswer: string | null;
  answerCorrectness: Record<string, boolean | null>;
}) {
  return (
    <>
      <p className="exercise-prompt">{exercise.prompt}</p>
      <button className="btn btn-secondary replay-btn" onClick={onReplayWord}>
        <span className="sound-icon">&#x1F50A;</span> Hear the word
      </button>
      <div className="exercise-options">
        {exercise.options.map(opt => (
          <button
            key={opt.word}
            className={`btn btn-sound-option exercise-word-option ${
              answerCorrectness[opt.word] === true ? 'btn-correct' :
              answerCorrectness[opt.word] === false ? 'btn-wrong' : ''
            }`}
            disabled={selectedAnswer !== null}
            onClick={() => onAnswer(opt.word, opt.word === exercise.targetWord)}
          >
            <span className="sound-label">{opt.word}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export default function TrainPage() {
  return (
    <Suspense fallback={<div className="screen"><p>Loading...</p></div>}>
      <TrainContent />
    </Suspense>
  );
}
