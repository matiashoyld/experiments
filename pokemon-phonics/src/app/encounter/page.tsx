'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { useMusic } from '@/hooks/useMusic';
import { PhonemeData, getPhonemesBySet, getPhonemeById } from '@/data/phonemes';
import { getRegionById } from '@/data/regions';
import { selectEncounterPhoneme, selectChallengeType } from '@/lib/phoneme-select';
import { generateChallenge, Challenge } from '@/lib/challenge-gen';
import PokemonSprite from '@/components/PokemonSprite';
import LetterCard from '@/components/LetterCard';
import Confetti from '@/components/Confetti';
import { useHaptics } from '@/hooks/useHaptics';
import { sfxCorrect, sfxWrong, sfxThrow, sfxShake, sfxCatch, sfxFled, sfxEncounter } from '@/lib/sfx';
import './encounter.css';

type EncounterPhase =
  | 'walking'
  | 'transition'
  | 'appeared'
  | 'challenge'
  | 'success'
  | 'pokeball'
  | 'caught'
  | 'failure'
  | 'scaffold';

function EncounterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const regionId = parseInt(searchParams.get('region') || '1');
  const fromExplore = searchParams.get('from') === 'explore';
  const targetPokemonId = searchParams.get('pokemonId');
  const returnPath = fromExplore ? `/explore?region=${regionId}` : '/map';
  const { state, loaded, catchPokemon, addAttempt, updateState } = useGameState();
  const { speak, playPhoneme, playWord, stop, narrate } = useAudio();
  useMusic('encounter');
  const haptics = useHaptics();

  const [phase, setPhase] = useState<EncounterPhase>('transition');
  const [targetPhoneme, setTargetPhoneme] = useState<PhonemeData | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerCorrectness, setAnswerCorrectness] = useState<Record<string, boolean | null>>({});
  const [showStars, setShowStars] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const [pokeballShakes, setPokeballShakes] = useState(0);
  const challengeStartTime = useRef<number>(0);

  const region = getRegionById(regionId);

  // Initialize encounter
  useEffect(() => {
    if (!loaded || !state) return;

    // Use specific Pokemon if provided (from visible Pokemon on map), otherwise random
    let phoneme: PhonemeData | undefined;
    if (targetPokemonId) {
      phoneme = getPhonemeById(targetPokemonId);
    }
    if (!phoneme) {
      phoneme = selectEncounterPhoneme(
        region?.set || 1,
        state.currentSet,
        state.pokemon,
      );
    }
    setTargetPhoneme(phoneme);

    const challengeType = selectChallengeType(
      phoneme,
      state.pokemon[phoneme.id],
      state.currentSet,
    );
    setChallenge(generateChallenge(challengeType, phoneme, state.currentSet));

    // Start transition immediately (no walking phase)
    setPhase('transition');
  }, [loaded, state?.currentSet]); // eslint-disable-line react-hooks/exhaustive-deps

  // Classic Pokemon transition → appeared
  useEffect(() => {
    if (phase === 'transition') {
      sfxEncounter();
      const timer = setTimeout(() => setPhase('appeared'), 1800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Appeared narration → challenge
  const narrateRef = useRef(narrate);
  narrateRef.current = narrate;

  useEffect(() => {
    if (phase === 'appeared' && targetPhoneme) {
      narrateRef.current.encounter.appeared(targetPhoneme.id, targetPhoneme.pokemon.name).then(() => {
        setTimeout(() => {
          setPhase('challenge');
          challengeStartTime.current = Date.now();
        }, 800);
      });
    }
  }, [phase, targetPhoneme]);

  // Narrate challenge instruction and auto-play sounds
  useEffect(() => {
    if (phase !== 'challenge' || !challenge) return;

    const narrateChallenge = async () => {
      if (challenge.type === 'A') {
        await narrate.challenge.whatSound();
      } else if (challenge.type === 'B') {
        await narrate.challenge.whichLetter();
        await new Promise(r => setTimeout(r, 300));
        await playPhoneme(challenge.correctPhonemeId).catch(() => {
          speak(challenge.correctGrapheme);
        });
      } else if (challenge.type === 'C') {
        await narrate.challenge.firstSound(challenge.word);
        await new Promise(r => setTimeout(r, 300));
        await playWord(challenge.word);
      } else if (challenge.type === 'D') {
        await narrate.challenge.readWord();
      }
    };

    const timer = setTimeout(narrateChallenge, 500);
    return () => clearTimeout(timer);
  }, [phase, challenge, playPhoneme, playWord, speak, narrate]);

  // Pokeball animation sequence
  useEffect(() => {
    if (phase === 'pokeball') {
      sfxThrow();
      let shakeCount = 0;
      const interval = setInterval(() => {
        shakeCount++;
        setPokeballShakes(shakeCount);
        haptics.pokeballShake();
        sfxShake();
        if (shakeCount >= 3) {
          clearInterval(interval);
          haptics.pokeballCatch();
          sfxCatch();
          setTimeout(() => setPhase('caught'), 500);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Caught phase — show stars, narrate, update state
  useEffect(() => {
    if (phase === 'caught' && targetPhoneme && state) {
      setShowStars(true);
      setShowConfetti(true);
      const alreadyCaught = state.pokemon[targetPhoneme.id]?.caught;

      if (!alreadyCaught) {
        catchPokemon(targetPhoneme.id);
      }
      narrate.encounter.caught(targetPhoneme.id, targetPhoneme.pokemon.name);

      // Increment encounters
      updateState(prev => ({
        ...prev,
        session: {
          ...prev.session,
          encountersThisSession: prev.session.encountersThisSession + 1,
        },
      }));
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scaffold phase — show correct answer briefly, then return
  useEffect(() => {
    if (phase === 'scaffold') {
      const timer = setTimeout(() => {
        router.push(returnPath);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, router]);

  const handleAnswer = useCallback((answerId: string, isCorrect: boolean) => {
    if (selectedAnswer !== null || !targetPhoneme) return;

    setSelectedAnswer(answerId);
    const responseTimeMs = Date.now() - challengeStartTime.current;

    // Mark correctness for visual feedback
    setAnswerCorrectness({ [answerId]: isCorrect });

    // Record attempt
    addAttempt(targetPhoneme.id, {
      correct: isCorrect,
      timestamp: Date.now(),
      responseTimeMs,
      challengeType: challenge?.type || 'A',
    });

    if (isCorrect) {
      haptics.correctAnswer();
      sfxCorrect();
      setShowCorrectFlash(true);
      setTimeout(() => setShowCorrectFlash(false), 600);
      narrate.challenge.success().then(() => {
        setTimeout(() => setPhase('pokeball'), 300);
      });
    } else {
      haptics.wrongAnswer();
      sfxWrong();
      narrate.encounter.fled(targetPhoneme.id, targetPhoneme.pokemon.name).then(() => {
        setTimeout(() => {
          setPhase('failure');
          haptics.pokemonFled();
          sfxFled();
          setTimeout(() => {
            setPhase('scaffold');
          }, 1500);
        }, 500);
      });
    }
  }, [selectedAnswer, targetPhoneme, challenge, addAttempt, speak, narrate]);

  const handlePlaySound = useCallback((phonemeId: string) => {
    playPhoneme(phonemeId).catch(() => {
      const phonemes = getPhonemesBySet(1);
      const found = phonemes.find(p => p.id === phonemeId) ||
        [...getPhonemesBySet(2), ...getPhonemesBySet(3), ...getPhonemesBySet(4), ...getPhonemesBySet(5), ...getPhonemesBySet(6), ...getPhonemesBySet(7)].find(p => p.id === phonemeId);
      if (found) speak(found.displayGrapheme);
    });
  }, [playPhoneme, speak]);

  const handlePlayWord = useCallback((word: string) => {
    playWord(word).catch(() => speak(word));
  }, [playWord, speak]);

  if (!loaded || !state || !targetPhoneme) {
    return <div className="screen"><div className="encounter-loading">Loading...</div></div>;
  }

  const pokemonId = targetPhoneme.pokemon.evolutionLine.stage1.id;
  const pokemonName = targetPhoneme.pokemon.name;

  return (
    <div className="screen encounter-screen">
      <Confetti trigger={showConfetti} intensity="high" />
      {/* Walking Phase */}
      {phase === 'walking' && (
        <div className="encounter-walking">
          <div className="walking-scene">
            <div className="grass-field">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="grass-tuft" style={{
                  left: `${(i % 4) * 25 + Math.random() * 10}%`,
                  top: `${Math.floor(i / 4) * 30 + 20 + Math.random() * 10}%`,
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
            <div className="trainer-sprite">
              <div className="trainer-body" />
            </div>
          </div>
          <p className="encounter-region-name">{region?.name || 'Tall Grass'}</p>
        </div>
      )}

      {/* Classic Pokemon Battle Transition */}
      {phase === 'transition' && (
        <div className="encounter-transition">
          <div className="transition-flash" />
          <div className="transition-stripes">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="transition-stripe" style={{ animationDelay: `${0.4 + i * 0.06}s` }} />
            ))}
          </div>
          <div className="transition-fade-to-black" />
        </div>
      )}

      {/* Pokemon Appeared */}
      {phase === 'appeared' && (
        <div className="encounter-appeared fade-in">
          <div className="appeared-pokemon bounce-in">
            <PokemonSprite
              pokedexId={pokemonId}
              name={pokemonName}
              size={180}
              bounce
            />
          </div>
          <div className="appeared-text slide-up">
            <h2>A wild {pokemonName} appeared!</h2>
          </div>
        </div>
      )}

      {/* Challenge Phase */}
      {phase === 'challenge' && challenge && (
        <div className="encounter-challenge fade-in">
          {/* Pokemon display */}
          <div className="challenge-pokemon">
            <PokemonSprite
              pokedexId={pokemonId}
              name={pokemonName}
              size={140}
              bounce
            />
            <p className="pokemon-name-label">{pokemonName}</p>
          </div>

          {/* Challenge content */}
          <div className="challenge-content">
            {challenge.type === 'A' && (
              <ChallengeA
                challenge={challenge}
                onAnswer={handleAnswer}
                onPlaySound={handlePlaySound}
                selectedAnswer={selectedAnswer}
                answerCorrectness={answerCorrectness}
              />
            )}
            {challenge.type === 'B' && (
              <ChallengeB
                challenge={challenge}
                onAnswer={handleAnswer}
                onReplaySound={() => handlePlaySound(challenge.correctPhonemeId)}
                selectedAnswer={selectedAnswer}
                answerCorrectness={answerCorrectness}
              />
            )}
            {challenge.type === 'C' && (
              <ChallengeC
                challenge={challenge}
                onAnswer={handleAnswer}
                onReplayWord={() => handlePlayWord(challenge.word)}
                selectedAnswer={selectedAnswer}
                answerCorrectness={answerCorrectness}
              />
            )}
            {challenge.type === 'D' && (
              <ChallengeD
                challenge={challenge}
                onAnswer={handleAnswer}
                onPlaySound={handlePlaySound}
                onPlayWord={handlePlayWord}
                selectedAnswer={selectedAnswer}
                answerCorrectness={answerCorrectness}
              />
            )}
          </div>
        </div>
      )}

      {/* Pokeball Throw Animation */}
      {phase === 'pokeball' && (
        <div className="encounter-pokeball">
          <div className="pokeball-scene">
            <div className={`pokeball pokeball-throw`}>
              <div className="pokeball-top" />
              <div className="pokeball-band">
                <div className="pokeball-button" />
              </div>
              <div className="pokeball-bottom" />
            </div>
            {pokeballShakes > 0 && (
              <div className={`pokeball-ground pokeball-shake-${Math.min(pokeballShakes, 3)}`}>
                <div className="pokeball-top" />
                <div className="pokeball-band">
                  <div className="pokeball-button" />
                </div>
                <div className="pokeball-bottom" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Caught! */}
      {phase === 'caught' && (
        <div className="encounter-caught fade-in">
          <div className="caught-pokemon bounce-in">
            <PokemonSprite
              pokedexId={pokemonId}
              name={pokemonName}
              size={180}
              bounce
            />
          </div>
          <h2 className="caught-text slide-up">Gotcha!</h2>
          <p className="caught-subtext slide-up">
            {state.pokemon[targetPhoneme.id]?.caught
              ? `${pokemonName} gained experience!`
              : `${pokemonName} was added to your Pokedex!`}
          </p>
          <button
            className="btn btn-success btn-pulse"
            style={{ marginTop: 24 }}
            onClick={() => router.push(returnPath)}
          >
            Continue
          </button>
        </div>
      )}

      {/* Failure */}
      {phase === 'failure' && (
        <div className="encounter-failure fade-in">
          <div className="failure-pokemon pokemon-flee">
            <PokemonSprite
              pokedexId={pokemonId}
              name={pokemonName}
              size={140}
              bounce
            />
          </div>
          <h2 className="failure-text">Oh no, {pokemonName} fled!</h2>
          <p className="failure-subtext">
            Don&apos;t worry, {pokemonName} is still in the tall grass!
          </p>
        </div>
      )}

      {/* Scaffold — show correct answer */}
      {phase === 'scaffold' && challenge && targetPhoneme && (
        <div className="encounter-scaffold fade-in">
          <p className="scaffold-text">The answer was:</p>
          <div className="scaffold-answer">
            <LetterCard
              grapheme={targetPhoneme.displayGrapheme}
              size="large"
              correct={true}
            />
          </div>
          <p className="scaffold-hint">{targetPhoneme.mnemonicPhrase}</p>
          <p className="scaffold-back">You&apos;ll find {pokemonName} again soon!</p>
        </div>
      )}

      {/* Correct answer flash */}
      {showCorrectFlash && (
        <>
          <div className="correct-flash" />
          <div className="floating-xp">+1 XP</div>
        </>
      )}

      {/* Star confetti */}
      {showStars && (
        <div className="stars">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.8 + Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// === Challenge Type Components ===

function ChallengeA({
  challenge,
  onAnswer,
  onPlaySound,
  selectedAnswer,
  answerCorrectness,
}: {
  challenge: { type: 'A'; grapheme: string; correctPhonemeId: string; options: { phonemeId: string; grapheme: string }[] };
  onAnswer: (id: string, correct: boolean) => void;
  onPlaySound: (id: string) => void;
  selectedAnswer: string | null;
  answerCorrectness: Record<string, boolean | null>;
}) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  return (
    <>
      <p className="challenge-prompt">What sound does this letter make?</p>
      <div className="challenge-grapheme-display">
        <LetterCard grapheme={challenge.grapheme} size="large" />
      </div>
      <div className="challenge-options">
        {challenge.options.map(opt => (
          <button
            key={opt.phonemeId}
            className={`btn btn-sound-option ${
              previewId === opt.phonemeId ? 'btn-previewing' : ''
            } ${
              answerCorrectness[opt.phonemeId] === true ? 'btn-correct' :
              answerCorrectness[opt.phonemeId] === false ? 'btn-wrong' : ''
            }`}
            disabled={selectedAnswer !== null}
            onClick={() => {
              if (previewId === opt.phonemeId) {
                // Second tap — confirm answer
                onAnswer(opt.phonemeId, opt.phonemeId === challenge.correctPhonemeId);
              } else {
                // First tap — preview sound
                setPreviewId(opt.phonemeId);
                onPlaySound(opt.phonemeId);
              }
            }}
          >
            <span className="sound-icon">&#x1F50A;</span>
            {previewId === opt.phonemeId && <span className="confirm-label">Tap to choose</span>}
          </button>
        ))}
      </div>
    </>
  );
}

function ChallengeB({
  challenge,
  onAnswer,
  onReplaySound,
  selectedAnswer,
  answerCorrectness,
}: {
  challenge: { type: 'B'; correctPhonemeId: string; correctGrapheme: string; options: { phonemeId: string; grapheme: string }[] };
  onAnswer: (id: string, correct: boolean) => void;
  onReplaySound: () => void;
  selectedAnswer: string | null;
  answerCorrectness: Record<string, boolean | null>;
}) {
  return (
    <>
      <p className="challenge-prompt">Which letter makes this sound?</p>
      <button className="btn btn-secondary replay-btn" onClick={onReplaySound}>
        <span className="sound-icon">&#x1F50A;</span> Hear again
      </button>
      <div className="challenge-options-letters">
        {challenge.options.map(opt => (
          <LetterCard
            key={opt.phonemeId}
            grapheme={opt.grapheme}
            size="medium"
            correct={answerCorrectness[opt.phonemeId] ?? null}
            disabled={selectedAnswer !== null}
            onClick={() => onAnswer(opt.phonemeId, opt.phonemeId === challenge.correctPhonemeId)}
          />
        ))}
      </div>
    </>
  );
}

function ChallengeC({
  challenge,
  onAnswer,
  onReplayWord,
  selectedAnswer,
  answerCorrectness,
}: {
  challenge: { type: 'C'; prompt: string; word: string; correctPhonemeId: string; options: { phonemeId: string; grapheme: string }[] };
  onAnswer: (id: string, correct: boolean) => void;
  onReplayWord: () => void;
  selectedAnswer: string | null;
  answerCorrectness: Record<string, boolean | null>;
}) {
  return (
    <>
      <p className="challenge-prompt">{challenge.prompt}</p>
      <button className="btn btn-secondary replay-btn" onClick={onReplayWord}>
        <span className="sound-icon">&#x1F50A;</span> Hear &ldquo;{challenge.word}&rdquo; again
      </button>
      <div className="challenge-options-letters">
        {challenge.options.map(opt => (
          <LetterCard
            key={opt.phonemeId}
            grapheme={opt.grapheme}
            size="medium"
            correct={answerCorrectness[opt.phonemeId] ?? null}
            disabled={selectedAnswer !== null}
            onClick={() => onAnswer(opt.phonemeId, opt.phonemeId === challenge.correctPhonemeId)}
          />
        ))}
      </div>
    </>
  );
}

function ChallengeD({
  challenge,
  onAnswer,
  onPlaySound,
  onPlayWord,
  selectedAnswer,
  answerCorrectness,
}: {
  challenge: { type: 'D'; word: { word: string; phonemes: string[] }; letters: string[]; correctWord: string; options: { word: string }[] };
  onAnswer: (id: string, correct: boolean) => void;
  onPlaySound: (id: string) => void;
  onPlayWord: (word: string) => void;
  selectedAnswer: string | null;
  answerCorrectness: Record<string, boolean | null>;
}) {
  const [previewWord, setPreviewWord] = useState<string | null>(null);

  return (
    <>
      <p className="challenge-prompt">Can you read this word?</p>
      <div className="challenge-word-display">
        {challenge.letters.map((letter, i) => (
          <LetterCard
            key={`${letter}-${i}`}
            grapheme={letter}
            size="medium"
            onClick={() => onPlaySound(letter)}
          />
        ))}
      </div>
      <p className="challenge-hint-text">Tap each letter to hear its sound!</p>
      <div className="challenge-options">
        {challenge.options.map(opt => (
          <button
            key={opt.word}
            className={`btn btn-sound-option ${
              previewWord === opt.word ? 'btn-previewing' : ''
            } ${
              answerCorrectness[opt.word] === true ? 'btn-correct' :
              answerCorrectness[opt.word] === false ? 'btn-wrong' : ''
            }`}
            disabled={selectedAnswer !== null}
            onClick={() => {
              if (previewWord === opt.word) {
                // Second tap — confirm answer
                onAnswer(opt.word, opt.word === challenge.correctWord);
              } else {
                // First tap — preview sound
                setPreviewWord(opt.word);
                onPlayWord(opt.word);
              }
            }}
          >
            <span className="sound-icon">&#x1F50A;</span>
            <span className="sound-label">{opt.word}</span>
            {previewWord === opt.word && <span className="confirm-label">Tap to choose</span>}
          </button>
        ))}
      </div>
    </>
  );
}

export default function EncounterPage() {
  return (
    <Suspense fallback={<div className="screen"><div className="encounter-loading">Loading...</div></div>}>
      <EncounterContent />
    </Suspense>
  );
}
