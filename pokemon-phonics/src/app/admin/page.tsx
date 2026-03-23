'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_PHONEMES, getPhonemesBySet } from '@/data/phonemes';
import { WORD_SETS } from '@/data/words';
import { ALL_NARRATION, getNarrationByCategory } from '@/data/narration';
import { REGIONS } from '@/data/regions';
import { getOfficialArtwork } from '@/data/pokemon';
import { calculateMastery } from '@/lib/mastery';
import './admin.css';

type Tab = 'phonemes' | 'narration' | 'words' | 'progress' | 'mapping';

interface AudioStatus {
  [key: string]: boolean;
}

interface BatchProgress {
  active: boolean;
  current: number;
  total: number;
  currentKey: string;
  errors: string[];
}

// ============================
// Main Admin Panel
// ============================
export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('progress');
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({});
  const [statusLoaded, setStatusLoaded] = useState(false);

  // Load existing audio file status on mount
  useEffect(() => {
    fetch('/api/generate-audio')
      .then(res => res.json())
      .then(data => {
        setAudioStatus(data);
        setStatusLoaded(true);
      })
      .catch(() => setStatusLoaded(true));
  }, []);

  const refreshStatus = useCallback(() => {
    fetch('/api/generate-audio')
      .then(res => res.json())
      .then(data => setAudioStatus(data))
      .catch(() => {});
  }, []);

  return (
    <div className="admin-screen">
      <div className="admin-header">
        <h1>Pokemon Phonics Admin</h1>
        <div className="admin-header-actions">
          <button className="btn-admin" onClick={refreshStatus}>
            Refresh Status
          </button>
          <a href="/" className="btn-admin">
            Back to Game
          </a>
        </div>
      </div>

      <div className="admin-tabs">
        {([
          ['progress', 'Progress'],
          ['phonemes', 'Phoneme Recorder'],
          ['narration', 'TTS Narration'],
          ['words', 'Word Audio'],
          ['mapping', 'Pokemon Mapping'],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            className={`admin-tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === 'progress' && <ProgressDashboard />}
        {tab === 'phonemes' && (
          <PhonemeRecorder
            audioStatus={audioStatus}
            statusLoaded={statusLoaded}
            onRefresh={refreshStatus}
          />
        )}
        {tab === 'narration' && (
          <NarrationGenerator
            audioStatus={audioStatus}
            onRefresh={refreshStatus}
          />
        )}
        {tab === 'words' && (
          <WordGenerator
            audioStatus={audioStatus}
            onRefresh={refreshStatus}
          />
        )}
        {tab === 'mapping' && <PokemonMapping />}
      </div>
    </div>
  );
}

// ============================
// Tab 1: Progress Dashboard
// ============================
function ProgressDashboard() {
  const [gameState, setGameState] = useState<Record<string, unknown> | null>(null);
  const [resetStep, setResetStep] = useState(0);
  const [resetInput, setResetInput] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pokemon-phonics-game-state');
      if (saved) setGameState(JSON.parse(saved));
    } catch { /* empty */ }
  }, []);

  if (!gameState) {
    return (
      <div className="admin-section">
        <h2>Progress Dashboard</h2>
        <p className="desc">No game data found. Start playing to see progress here!</p>
      </div>
    );
  }

  const state = gameState as {
    playerName: string;
    currentSet: number;
    pokemon: Record<string, {
      caught: boolean;
      stage: number;
      xp: number;
      isShiny: boolean;
      attempts: { correct: boolean; timestamp: number; responseTimeMs: number }[];
    }>;
    badges: string[];
    stats: {
      totalCatches: number;
      totalEvolutions: number;
      totalBattlesWon: number;
      totalCorrectAnswers: number;
      totalAttempts: number;
      sessionsCompleted: number;
    };
    session: { streak: number; startTime: number | null };
    settings: { sessionLengthMinutes: number };
    createdAt: string;
  };

  const caughtCount = Object.values(state.pokemon).filter(p => p.caught).length;
  const evolvedCount = Object.values(state.pokemon).filter(p => p.stage > 1).length;
  const shinyCount = Object.values(state.pokemon).filter(p => p.isShiny).length;
  const badgeCount = state.badges.length;

  // Per-phoneme mastery for caught Pokemon
  const phonemeMastery = ALL_PHONEMES
    .filter(p => state.pokemon[p.id]?.caught)
    .map(p => ({
      id: p.id,
      grapheme: p.grapheme,
      mastery: calculateMastery(state.pokemon[p.id].attempts as { correct: boolean; timestamp: number; responseTimeMs: number; challengeType: string }[]),
      attempts: state.pokemon[p.id].attempts.length,
    }))
    .sort((a, b) => a.mastery - b.mastery);

  const weakest = phonemeMastery.slice(0, 5);
  const strongest = [...phonemeMastery].sort((a, b) => b.mastery - a.mastery).slice(0, 5);

  const handleReset = () => {
    if (resetInput === 'RESET') {
      localStorage.removeItem('pokemon-phonics-game-state');
      fetch('/api/game-state', { method: 'DELETE' }).catch(() => {});
      setGameState(null);
      setResetStep(0);
      setResetInput('');
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(gameState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokemon-phonics-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Overview Stats */}
      <div className="dashboard-grid">
        <div className="dash-card">
          <h3>Player</h3>
          <div className="dash-stat">
            <span className="value">{state.playerName || 'Trainer'}</span>
          </div>
          <div className="dash-stat">
            <span className="value">{state.currentSet}</span>
            <span className="label">current set</span>
          </div>
          <div className="dash-stat">
            <span className="value">{state.session.streak}</span>
            <span className="label">day streak</span>
          </div>
        </div>

        <div className="dash-card">
          <h3>Collection</h3>
          <div className="dash-stat">
            <span className="value">{caughtCount}</span>
            <span className="label">/ {ALL_PHONEMES.length} caught</span>
          </div>
          <div className="dash-stat">
            <span className="value">{evolvedCount}</span>
            <span className="label">evolved</span>
          </div>
          <div className="dash-stat">
            <span className="value">{shinyCount}</span>
            <span className="label">shiny</span>
          </div>
        </div>

        <div className="dash-card">
          <h3>Performance</h3>
          <div className="dash-stat">
            <span className="value">
              {state.stats.totalAttempts > 0
                ? Math.round((state.stats.totalCorrectAnswers / state.stats.totalAttempts) * 100)
                : 0}%
            </span>
            <span className="label">accuracy</span>
          </div>
          <div className="dash-stat">
            <span className="value">{state.stats.totalAttempts}</span>
            <span className="label">total attempts</span>
          </div>
        </div>

        <div className="dash-card">
          <h3>Badges ({badgeCount}/7)</h3>
          <div className="badge-row">
            {REGIONS.filter(r => r.phase === 1).map(region => {
              const earned = state.badges.includes(`gym-${region.id}`);
              return (
                <div
                  key={region.id}
                  className={`badge-display ${earned ? '' : 'empty'}`}
                  style={earned ? { backgroundColor: region.badgeColor } : {}}
                  title={earned ? region.badgeName : 'Not earned'}
                >
                  {earned ? '★' : '?'}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mastery Bars */}
      {phonemeMastery.length > 0 && (
        <div className="admin-section" style={{ marginTop: 16 }}>
          <h2>Phoneme Mastery</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            {phonemeMastery.map(pm => (
              <div key={pm.id} className="mastery-bar-row">
                <span className="phoneme-label">{pm.grapheme}</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${pm.mastery < 0.5 ? 'low' : pm.mastery < 0.8 ? 'mid' : 'high'}`}
                    style={{ width: `${Math.round(pm.mastery * 100)}%` }}
                  />
                </div>
                <span className="pct">{Math.round(pm.mastery * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weakest / Strongest */}
      {weakest.length > 0 && (
        <div className="dashboard-grid" style={{ marginTop: 16 }}>
          <div className="dash-card">
            <h3>Weakest Phonemes (need attention)</h3>
            {weakest.map(pm => (
              <div key={pm.id} className="mastery-bar-row">
                <span className="phoneme-label">{pm.grapheme}</span>
                <div className="bar-track">
                  <div className="bar-fill low" style={{ width: `${Math.round(pm.mastery * 100)}%` }} />
                </div>
                <span className="pct">{Math.round(pm.mastery * 100)}%</span>
              </div>
            ))}
          </div>
          <div className="dash-card">
            <h3>Strongest Phonemes</h3>
            {strongest.map(pm => (
              <div key={pm.id} className="mastery-bar-row">
                <span className="phoneme-label">{pm.grapheme}</span>
                <div className="bar-track">
                  <div className="bar-fill high" style={{ width: `${Math.round(pm.mastery * 100)}%` }} />
                </div>
                <span className="pct">{Math.round(pm.mastery * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Caught Pokemon Grid */}
      {caughtCount > 0 && (
        <div className="admin-section" style={{ marginTop: 16 }}>
          <h2>Caught Pokemon</h2>
          <div className="pokemon-mini-grid">
            {ALL_PHONEMES.filter(p => state.pokemon[p.id]?.caught).map(p => {
              const ps = state.pokemon[p.id];
              const evoLine = p.pokemon.evolutionLine;
              const spriteId = ps.stage === 3 ? evoLine.stage3.id : ps.stage === 2 ? evoLine.stage2.id : evoLine.stage1.id;
              return (
                <div
                  key={p.id}
                  className={`pokemon-mini caught ${ps.isShiny ? 'shiny' : ''}`}
                  title={`${p.pokemon.name} (${p.grapheme}) - Stage ${ps.stage} - ${ps.xp} XP`}
                >
                  <img src={getOfficialArtwork(spriteId)} alt={p.pokemon.name} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session Settings */}
      <div className="admin-section" style={{ marginTop: 16 }}>
        <h2>Session Settings</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Session length (minutes):</label>
          <select
            value={state.settings?.sessionLengthMinutes ?? 8}
            onChange={(e) => {
              const updated = {
                ...gameState,
                settings: { ...(gameState as Record<string, unknown>).settings as Record<string, unknown>, sessionLengthMinutes: parseInt(e.target.value) },
                updatedAt: new Date().toISOString(),
              };
              localStorage.setItem('pokemon-phonics-game-state', JSON.stringify(updated));
              setGameState(updated);
            }}
            style={{ padding: '6px 12px', borderRadius: 6, border: '2px solid #ddd', fontFamily: 'inherit', fontSize: '0.9rem' }}
          >
            {[5, 6, 7, 8, 10, 12, 15, 20, 30].map(n => (
              <option key={n} value={n}>{n} min</option>
            ))}
          </select>
        </div>
        <p className="desc" style={{ margin: 0 }}>
          Warning shows at {state.settings?.sessionLengthMinutes ?? 8} min. Gentle lock at {(state.settings?.sessionLengthMinutes ?? 8) + 2} min.
          Sessions completed: <strong>{state.stats.sessionsCompleted}</strong>.
          {state.session.startTime && (
            <> Currently in session ({Math.round((Date.now() - state.session.startTime) / 60000)} min elapsed).</>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="admin-section" style={{ marginTop: 16 }}>
        <h2>Actions</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-admin primary" onClick={handleExport}>
            Export Progress (JSON)
          </button>
          <button
            className="btn-admin danger"
            onClick={() => setResetStep(1)}
          >
            Reset All Progress
          </button>
        </div>

        {resetStep >= 1 && (
          <div className="reset-confirm">
            {resetStep === 1 && (
              <>
                <p><strong>Are you sure?</strong> This will delete all game progress permanently.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-admin danger" onClick={() => setResetStep(2)}>
                    Yes, I want to reset
                  </button>
                  <button className="btn-admin" onClick={() => setResetStep(0)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
            {resetStep === 2 && (
              <>
                <p>Type <strong>RESET</strong> to confirm:</p>
                <input
                  value={resetInput}
                  onChange={e => setResetInput(e.target.value)}
                  placeholder="Type RESET here"
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-admin danger"
                    disabled={resetInput !== 'RESET'}
                    onClick={handleReset}
                  >
                    Permanently Delete
                  </button>
                  <button className="btn-admin" onClick={() => { setResetStep(0); setResetInput(''); }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ============================
// Tab 2: Phoneme Recorder
// ============================
function PhonemeRecorder({
  audioStatus,
  statusLoaded,
  onRefresh,
}: {
  audioStatus: AudioStatus;
  statusLoaded: boolean;
  onRefresh: () => void;
}) {
  const [recording, setRecording] = useState<string | null>(null);
  const [recordingPhase, setRecordingPhase] = useState<'countdown' | 'recording' | 'preview' | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isRecorded = (phonemeId: string) => audioStatus[`phonemes/${phonemeId}`];

  const recordedCount = ALL_PHONEMES.filter(p => isRecorded(p.id)).length;

  const startRecording = async (phonemeId: string) => {
    setRecording(phonemeId);
    setRecordingPhase('countdown');
    setCountdown(3);

    // Countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setRecordingPhase('recording');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setRecordingPhase('preview');
      };

      mediaRecorder.start();

      // Auto-stop after 3 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          stream.getTracks().forEach(t => t.stop());
        }
      }, 3000);
    } catch {
      setRecording(null);
      setRecordingPhase(null);
      alert('Could not access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
    }
  };

  const saveRecording = async () => {
    if (!recording || chunksRef.current.length === 0) return;

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob);
    formData.append('phonemeId', recording);

    try {
      await fetch('/api/save-phoneme', {
        method: 'POST',
        body: formData,
      });
      onRefresh();
    } catch {
      // If the save-phoneme endpoint doesn't exist yet, download locally
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }

    cancelRecording();
  };

  const cancelRecording = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setRecording(null);
    setRecordingPhase(null);
    setPreviewUrl(null);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const playExisting = (phonemeId: string) => {
    const audio = new Audio(`/audio/phonemes/${phonemeId}.mp3`);
    audio.play().catch(() => {});
  };

  const phoneme = recording ? ALL_PHONEMES.find(p => p.id === recording) : null;

  return (
    <>
      <div className="admin-section">
        <h2>Phoneme Recorder</h2>
        <p className="desc">
          Record the ~{ALL_PHONEMES.length} phoneme sounds using your voice. Say just the sound, not the letter name.
          {statusLoaded && (
            <> — <strong>{recordedCount}/{ALL_PHONEMES.length}</strong> recorded</>
          )}
        </p>

        {[1, 2, 3, 4, 5, 6, 7].map(set => {
          const phonemes = getPhonemesBySet(set);
          return (
            <div key={set} style={{ marginBottom: 16 }}>
              <h3>Set {set}: {phonemes.map(p => p.grapheme).join(', ')}</h3>
              <div className="phoneme-grid">
                {phonemes.map(p => (
                  <div key={p.id} className={`phoneme-card ${isRecorded(p.id) ? 'recorded' : ''}`}>
                    <div className={`status-dot ${isRecorded(p.id) ? 'recorded' : 'missing'}`} />
                    <span className="grapheme">{p.displayGrapheme}</span>
                    <span className="sound-desc">{p.description}</span>
                    <div className="phoneme-card-actions">
                      <button
                        className="btn-admin record"
                        onClick={() => startRecording(p.id)}
                        title="Record"
                      >
                        &#x1F3A4;
                      </button>
                      {isRecorded(p.id) && (
                        <button
                          className="btn-admin"
                          onClick={() => playExisting(p.id)}
                          title="Play"
                        >
                          &#x1F50A;
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recording Modal */}
      {recording && phoneme && (
        <div className="recording-overlay" onClick={(e) => e.target === e.currentTarget && cancelRecording()}>
          <div className="recording-modal">
            <h3>Record: {phoneme.description}</h3>
            <div className="grapheme-large">{phoneme.displayGrapheme}</div>

            {recordingPhase === 'countdown' && (
              <div className="countdown">{countdown}</div>
            )}

            {recordingPhase === 'recording' && (
              <>
                <div className="recording-status">Recording...</div>
                <button className="btn-admin danger" onClick={stopRecording}>
                  Stop
                </button>
              </>
            )}

            {recordingPhase === 'preview' && previewUrl && (
              <>
                <p style={{ color: '#666', marginBottom: 12 }}>Preview:</p>
                <audio src={previewUrl} controls autoPlay style={{ marginBottom: 16 }} />
                <div className="recording-modal-actions">
                  <button className="btn-admin success" onClick={saveRecording}>
                    Save
                  </button>
                  <button className="btn-admin" onClick={() => startRecording(recording)}>
                    Re-record
                  </button>
                  <button className="btn-admin" onClick={cancelRecording}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {recordingPhase === 'countdown' && (
              <p style={{ color: '#888', marginTop: 12, fontSize: '0.85rem' }}>
                Say just the sound: &ldquo;{phoneme.sound}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ============================
// Tab 3: TTS Narration Generator
// ============================
function NarrationGenerator({
  audioStatus,
  onRefresh,
}: {
  audioStatus: AudioStatus;
  onRefresh: () => void;
}) {
  const categorized = getNarrationByCategory();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [batch, setBatch] = useState<BatchProgress>({
    active: false, current: 0, total: 0, currentKey: '', errors: [],
  });
  const abortRef = useRef<AbortController | null>(null);

  const isCached = (key: string) => audioStatus[`tts/${key}`];

  const totalEntries = ALL_NARRATION.length;
  const cachedCount = ALL_NARRATION.filter(e => isCached(e.key)).length;
  const missingEntries = ALL_NARRATION.filter(e => !isCached(e.key));

  const toggleCategory = (cat: string) => {
    setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const generateSingle = async (entry: typeof ALL_NARRATION[0]) => {
    setBatch({ active: true, current: 0, total: 1, currentKey: entry.key, errors: [] });

    try {
      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            key: entry.key,
            text: entry.text,
            voiceName: entry.voiceName,
            style: entry.style,
            type: 'tts',
          }],
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          const lines = text.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.status === 'complete' || data.status === 'done') {
                onRefresh();
              }
            } catch { /* skip parse errors */ }
          }
        }
      }
    } catch {
      // error
    }

    setBatch(prev => ({ ...prev, active: false }));
  };

  const generateAllMissing = async () => {
    if (missingEntries.length === 0) return;

    const controller = new AbortController();
    abortRef.current = controller;

    const items = missingEntries.map(e => ({
      key: e.key,
      text: e.text,
      voiceName: e.voiceName,
      style: e.style,
      type: 'tts' as const,
    }));

    setBatch({ active: true, current: 0, total: items.length, currentKey: '', errors: [] });

    try {
      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
        signal: controller.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.status === 'generating') {
                setBatch(prev => ({
                  ...prev,
                  current: data.progress,
                  currentKey: data.key,
                }));
              } else if (data.status === 'error') {
                setBatch(prev => ({
                  ...prev,
                  errors: [...prev.errors, `${data.key}: ${data.error}`],
                }));
              } else if (data.status === 'done') {
                onRefresh();
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        // User cancelled
      }
    }

    setBatch(prev => ({ ...prev, active: false }));
    onRefresh();
  };

  const cancelBatch = () => {
    abortRef.current?.abort();
    setBatch(prev => ({ ...prev, active: false }));
  };

  const playNarration = (key: string) => {
    const audio = new Audio(`/audio/tts/${key}.mp3`);
    audio.play().catch(() => {});
  };

  const estMinutes = Math.ceil((missingEntries.length * 6) / 60);

  return (
    <>
      <div className="admin-section">
        <h2>TTS Narration Generator</h2>
        <p className="desc">
          Pre-generate all game narration via Gemini TTS.
          <strong> {cachedCount}/{totalEntries}</strong> cached.
          {missingEntries.length > 0 && (
            <> {missingEntries.length} missing (~{estMinutes} min to generate).</>
          )}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className="btn-admin primary"
            disabled={batch.active || missingEntries.length === 0}
            onClick={generateAllMissing}
          >
            Generate All Missing ({missingEntries.length})
          </button>
          {batch.active && (
            <button className="btn-admin danger" onClick={cancelBatch}>
              Cancel
            </button>
          )}
        </div>

        {batch.active && (
          <div className="batch-bar">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(batch.current / batch.total) * 100}%` }}
              />
            </div>
            <span className="progress-text">{batch.current}/{batch.total}</span>
            <span className="time-est">
              ~{Math.ceil(((batch.total - batch.current) * 6) / 60)} min left
            </span>
          </div>
        )}

        {batch.errors.length > 0 && (
          <div style={{ color: '#F44336', fontSize: '0.8rem', marginBottom: 12 }}>
            {batch.errors.length} error(s):
            <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
              {batch.errors.slice(-5).map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Category list */}
      {Object.entries(categorized).map(([category, entries]) => {
        const catCached = entries.filter(e => isCached(e.key)).length;
        const isOpen = expanded[category];
        return (
          <div key={category} className="narration-category">
            <button
              className="narration-category-header"
              onClick={() => toggleCategory(category)}
            >
              <span>{isOpen ? '▼' : '▶'} {category}</span>
              <span className="count">{catCached}/{entries.length} cached</span>
            </button>
            {isOpen && (
              <div className="narration-list">
                {entries.map(entry => (
                  <div key={entry.key} className="narration-item">
                    <div className={`status-icon ${isCached(entry.key) ? 'cached' : 'missing'}`} />
                    <span className="key">{entry.key}</span>
                    <span className="text">{entry.text}</span>
                    <span className="voice">{entry.voiceName}</span>
                    {isCached(entry.key) ? (
                      <button className="btn-admin" onClick={() => playNarration(entry.key)}>
                        &#x1F50A;
                      </button>
                    ) : (
                      <button
                        className="btn-admin primary"
                        disabled={batch.active}
                        onClick={() => generateSingle(entry)}
                      >
                        Gen
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ============================
// Tab 4: Word Audio Generator
// ============================
function WordGenerator({
  audioStatus,
  onRefresh,
}: {
  audioStatus: AudioStatus;
  onRefresh: () => void;
}) {
  const [batch, setBatch] = useState<BatchProgress>({
    active: false, current: 0, total: 0, currentKey: '', errors: [],
  });
  const abortRef = useRef<AbortController | null>(null);

  const allWords = WORD_SETS.flatMap(ws => ws.words);
  const uniqueWords = [...new Set(allWords.map(w => w.word))];
  const isCached = (word: string) => audioStatus[`words/${word}`];
  const cachedCount = uniqueWords.filter(w => isCached(w)).length;
  const missingWords = uniqueWords.filter(w => !isCached(w));

  const generateAllMissing = async () => {
    if (missingWords.length === 0) return;

    const controller = new AbortController();
    abortRef.current = controller;

    const items = missingWords.map(word => ({
      key: word,
      text: word,
      voiceName: 'Puck',
      style: 'Say this word clearly and slowly for a child:',
      type: 'word' as const,
    }));

    setBatch({ active: true, current: 0, total: items.length, currentKey: '', errors: [] });

    try {
      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
        signal: controller.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.status === 'generating') {
                setBatch(prev => ({ ...prev, current: data.progress, currentKey: data.key }));
              } else if (data.status === 'error') {
                setBatch(prev => ({ ...prev, errors: [...prev.errors, `${data.key}: ${data.error}`] }));
              } else if (data.status === 'done') {
                onRefresh();
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') { /* cancelled */ }
    }

    setBatch(prev => ({ ...prev, active: false }));
    onRefresh();
  };

  const cancelBatch = () => {
    abortRef.current?.abort();
    setBatch(prev => ({ ...prev, active: false }));
  };

  const playWord = (word: string) => {
    const audio = new Audio(`/audio/words/${word}.mp3`);
    audio.play().catch(() => {});
  };

  const estMinutes = Math.ceil((missingWords.length * 6) / 60);

  return (
    <>
      <div className="admin-section">
        <h2>Word Audio Generator</h2>
        <p className="desc">
          Generate spoken audio for all CVC words.
          <strong> {cachedCount}/{uniqueWords.length}</strong> cached.
          {missingWords.length > 0 && (
            <> {missingWords.length} missing (~{estMinutes} min to generate).</>
          )}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className="btn-admin primary"
            disabled={batch.active || missingWords.length === 0}
            onClick={generateAllMissing}
          >
            Generate All Missing ({missingWords.length})
          </button>
          {batch.active && (
            <button className="btn-admin danger" onClick={cancelBatch}>Cancel</button>
          )}
        </div>

        {batch.active && (
          <div className="batch-bar">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(batch.current / batch.total) * 100}%` }}
              />
            </div>
            <span className="progress-text">{batch.current}/{batch.total}</span>
            <span className="time-est">~{Math.ceil(((batch.total - batch.current) * 6) / 60)} min left</span>
          </div>
        )}
      </div>

      {/* Word sets */}
      {WORD_SETS.map((ws, idx) => (
        <div key={idx} className="admin-section word-set-group">
          <h4>Sets {ws.sets.join(', ')} ({ws.words.length} words)</h4>
          <div className="word-chips">
            {ws.words.map(w => (
              <span
                key={w.word}
                className={`word-chip ${isCached(w.word) ? 'cached' : ''}`}
                onClick={() => isCached(w.word) && playWord(w.word)}
                style={{ cursor: isCached(w.word) ? 'pointer' : 'default' }}
                title={isCached(w.word) ? 'Click to play' : 'Not generated'}
              >
                <span
                  className="status-dot-small"
                  style={{ background: isCached(w.word) ? '#4CAF50' : '#ccc' }}
                />
                {w.word}
              </span>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// ============================
// Tab 5: Pokemon Mapping
// ============================
function PokemonMapping() {
  return (
    <div className="admin-section">
      <h2>Pokemon-to-Phoneme Mapping</h2>
      <p className="desc">View the current mapping of phonemes to Pokemon.</p>

      <table className="mapping-table">
        <thead>
          <tr>
            <th>Set</th>
            <th>Phoneme</th>
            <th>Sound</th>
            <th>Pokemon</th>
            <th>Sprite</th>
            <th>Evolution Line</th>
          </tr>
        </thead>
        <tbody>
          {ALL_PHONEMES.map(p => (
            <tr key={p.id}>
              <td>{p.set}</td>
              <td><strong style={{ fontSize: '1.1rem' }}>{p.displayGrapheme}</strong></td>
              <td style={{ color: '#666' }}>{p.sound}</td>
              <td>{p.pokemon.name}</td>
              <td>
                <img
                  className="mapping-sprite"
                  src={getOfficialArtwork(p.pokemon.id)}
                  alt={p.pokemon.name}
                />
              </td>
              <td>
                <div className="mapping-evo-line">
                  <img
                    src={getOfficialArtwork(p.pokemon.evolutionLine.stage1.id)}
                    alt={p.pokemon.evolutionLine.stage1.name}
                    title={p.pokemon.evolutionLine.stage1.name}
                  />
                  <span className="arrow">→</span>
                  <img
                    src={getOfficialArtwork(p.pokemon.evolutionLine.stage2.id)}
                    alt={p.pokemon.evolutionLine.stage2.name}
                    title={p.pokemon.evolutionLine.stage2.name}
                  />
                  <span className="arrow">→</span>
                  <img
                    src={getOfficialArtwork(p.pokemon.evolutionLine.stage3.id)}
                    alt={p.pokemon.evolutionLine.stage3.name}
                    title={p.pokemon.evolutionLine.stage3.name}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
