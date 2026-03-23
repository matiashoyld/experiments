/**
 * Standalone script to pre-generate all TTS audio files.
 *
 * Usage:
 *   npx tsx scripts/generate-audio.ts              # generate all (10 concurrent)
 *   npx tsx scripts/generate-audio.ts --type words  # only words
 *   npx tsx scripts/generate-audio.ts --type narration  # only narration
 *   npx tsx scripts/generate-audio.ts --dry-run     # show plan without calling API
 *   npx tsx scripts/generate-audio.ts --concurrency 20  # custom concurrency
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { ALL_NARRATION } from '../src/data/narration';
import { WORD_SETS } from '../src/data/words';
import { pcmToWav, base64ToArrayBuffer } from '../src/lib/pcm-to-wav';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');
const DEFAULT_CONCURRENCY = 1;
const MAX_RETRIES = 5;
const BATCH_GAP_MS = 6000; // pause between items to stay under rate limits

interface AudioItem {
  key: string;
  text: string;
  voiceName: string;
  style?: string;
  type: 'tts' | 'word';
}

function getFilePath(item: AudioItem): string {
  const subDir = item.type === 'word' ? 'words' : 'tts';
  return path.join(AUDIO_DIR, subDir, `${item.key}.wav`);
}

function buildItemList(typeFilter?: string): AudioItem[] {
  const items: AudioItem[] = [];

  if (!typeFilter || typeFilter === 'narration') {
    for (const entry of ALL_NARRATION) {
      items.push({
        key: entry.key,
        text: entry.text,
        voiceName: entry.voiceName,
        style: entry.style,
        type: 'tts',
      });
    }
  }

  if (!typeFilter || typeFilter === 'words') {
    const seenWords = new Set<string>();
    for (const set of WORD_SETS) {
      for (const w of set.words) {
        if (!seenWords.has(w.word)) {
          seenWords.add(w.word);
          items.push({
            key: w.word,
            text: w.word,
            voiceName: 'Puck',
            style: 'Say clearly:',
            type: 'word',
          });
        }
      }
    }
  }

  return items;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateTTS(text: string, voiceName: string, style?: string): Promise<ArrayBuffer> {
  const fullText = style ? `${style} ${text}` : text;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: fullText }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      }),
    });

    if (response.status === 429) {
      const backoff = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`  Rate limited, backing off ${backoff / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`);
      await sleep(backoff);
      continue;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${error.slice(0, 200)}`);
    }

    const data = await response.json();
    const audioPart = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!audioPart?.data) {
      throw new Error('No audio data in response');
    }

    const pcmBuffer = base64ToArrayBuffer(audioPart.data);
    return pcmToWav(pcmBuffer);
  }

  throw new Error(`Failed after ${MAX_RETRIES} retries (rate limited)`);
}

function saveFile(wavBuffer: ArrayBuffer, filePath: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, Buffer.from(wavBuffer));
}

function formatTime(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return mins > 0 ? `${mins}m ${remainSecs}s` : `${secs}s`;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const typeIdx = args.indexOf('--type');
  const typeFilter = typeIdx >= 0 ? args[typeIdx + 1] : undefined;
  const concIdx = args.indexOf('--concurrency');
  const concurrency = concIdx >= 0 ? parseInt(args[concIdx + 1], 10) : DEFAULT_CONCURRENCY;

  if (!GEMINI_API_KEY && !dryRun) {
    console.error('Error: GEMINI_API_KEY not found. Set it in .env.local');
    process.exit(1);
  }

  const allItems = buildItemList(typeFilter);
  const missing = allItems.filter(item => !fs.existsSync(getFilePath(item)));
  const skipped = allItems.length - missing.length;

  const estSeconds = Math.ceil(missing.length / concurrency) * 3; // ~3s per API call
  console.log(`\nAudio generation plan:`);
  console.log(`  Total items: ${allItems.length}`);
  console.log(`  Already exist (skip): ${skipped}`);
  console.log(`  To generate: ${missing.length}`);
  console.log(`  Concurrency: ${concurrency}`);
  if (missing.length > 0) {
    console.log(`  Estimated time: ${formatTime(estSeconds * 1000)}`);
  }

  if (dryRun) {
    console.log('\nDry run — items to generate:');
    for (const item of missing) {
      console.log(`  [${item.type}] ${item.key}: "${item.style ? item.style + ' ' : ''}${item.text}"`);
    }
    return;
  }

  if (missing.length === 0) {
    console.log('\nAll audio files already exist. Nothing to do.');
    return;
  }

  const startTime = Date.now();
  let completed = 0;
  let generated = 0;
  let failed = 0;
  const failures: { key: string; error: string }[] = [];

  // Process in batches of `concurrency`
  for (let i = 0; i < missing.length; i += concurrency) {
    const batch = missing.slice(i, i + concurrency);

    const results = await Promise.allSettled(
      batch.map(async (item) => {
        const filePath = getFilePath(item);
        const wavBuffer = await generateTTS(item.text, item.voiceName, item.style);
        saveFile(wavBuffer, filePath);
        return item;
      })
    );

    for (const result of results) {
      completed++;
      if (result.status === 'fulfilled') {
        generated++;
        const item = result.value;
        console.log(`[${completed}/${missing.length}] OK: ${item.type}/${item.key}`);
      } else {
        failed++;
        const errMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
        // Try to extract the key from the error context
        const batchIdx = results.indexOf(result);
        const failedItem = batch[batchIdx];
        failures.push({ key: failedItem.key, error: errMsg });
        console.error(`[${completed}/${missing.length}] FAIL: ${failedItem.type}/${failedItem.key} — ${errMsg}`);
      }
    }

    const elapsed = formatTime(Date.now() - startTime);
    const batchesLeft = Math.ceil((missing.length - i - batch.length) / concurrency);
    const avgBatchTime = (Date.now() - startTime) / (Math.floor(i / concurrency) + 1);
    const remaining = formatTime(batchesLeft * avgBatchTime);
    console.log(`  --- batch done (${elapsed} elapsed, ~${remaining} remaining) ---\n`);

    // Pause between batches to avoid rate limits
    if (i + batch.length < missing.length) {
      await sleep(BATCH_GAP_MS);
    }
  }

  const totalTime = formatTime(Date.now() - startTime);
  console.log(`=== Done ===`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped (existed): ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total time: ${totalTime}`);

  if (failures.length > 0) {
    console.log(`\nFailed items:`);
    for (const f of failures) {
      console.log(`  ${f.key}: ${f.error}`);
    }
    console.log(`\nRe-run the script to retry failed items.`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
