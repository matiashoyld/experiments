import { NextRequest } from 'next/server';
import { pcmToWav, base64ToArrayBuffer } from '@/lib/pcm-to-wav';
import * as fs from 'fs';
import * as path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

interface GenerateItem {
  key: string;
  text: string;
  voiceName?: string;
  style?: string;
  type: 'tts' | 'word';
}

async function generateTTS(text: string, voiceName = 'Puck', style?: string): Promise<ArrayBuffer> {
  const fullText = style ? `${style} ${text}` : text;

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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const audioPart = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;

  if (!audioPart?.data) {
    throw new Error('No audio data in Gemini response');
  }

  const pcmBuffer = base64ToArrayBuffer(audioPart.data);
  return pcmToWav(pcmBuffer);
}

function saveAudioFile(wavBuffer: ArrayBuffer, filePath: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, Buffer.from(wavBuffer));
}

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { items } = await request.json() as { items: GenerateItem[] };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return new Response(JSON.stringify({ error: 'Items array required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let generated = 0;
      let failed = 0;
      const publicDir = path.join(process.cwd(), 'public', 'audio');

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        send({
          status: 'generating',
          key: item.key,
          text: item.text,
          progress: i + 1,
          total: items.length,
        });

        try {
          const wavBuffer = await generateTTS(
            item.text,
            item.voiceName || 'Puck',
            item.style
          );

          // Determine save path based on type
          const subDir = item.type === 'word' ? 'words' : 'tts';
          const fileName = item.type === 'word'
            ? `${item.key}.wav`
            : `${item.key}.wav`;
          const filePath = path.join(publicDir, subDir, fileName);

          saveAudioFile(wavBuffer, filePath);
          generated++;

          send({
            status: 'complete',
            key: item.key,
            progress: i + 1,
            total: items.length,
          });
        } catch (error) {
          failed++;
          send({
            status: 'error',
            key: item.key,
            error: error instanceof Error ? error.message : 'Unknown error',
            progress: i + 1,
            total: items.length,
          });
        }

        // Rate limit: wait 6 seconds between requests (Gemini free tier: 10/min)
        if (i < items.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
      }

      send({ status: 'done', generated, failed, total: items.length });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// GET endpoint to check which audio files exist
export async function GET() {
  const publicDir = path.join(process.cwd(), 'public', 'audio');
  const existing: Record<string, boolean> = {};

  function scanDir(dir: string, prefix: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        scanDir(path.join(dir, entry.name), `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith('.wav')) {
        const key = `${prefix}${entry.name.replace('.wav', '')}`;
        existing[key] = true;
      }
    }
  }

  scanDir(path.join(publicDir, 'tts'), 'tts/');
  scanDir(path.join(publicDir, 'words'), 'words/');
  scanDir(path.join(publicDir, 'phonemes'), 'phonemes/');

  return new Response(JSON.stringify(existing), {
    headers: { 'Content-Type': 'application/json' },
  });
}
