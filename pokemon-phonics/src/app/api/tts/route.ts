import { NextRequest, NextResponse } from 'next/server';
import { pcmToWav, base64ToArrayBuffer } from '@/lib/pcm-to-wav';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const { text, voiceName = 'Puck', style } = await request.json();

  if (!text || text.length > 500) {
    return NextResponse.json({ error: 'Text required (max 500 chars)' }, { status: 400 });
  }

  const fullText = style ? `${style} ${text}` : text;

  try {
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
      console.error('Gemini TTS error:', error);
      return NextResponse.json({ error: 'TTS generation failed' }, { status: 502 });
    }

    const data = await response.json();
    const audioPart = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!audioPart?.data) {
      return NextResponse.json({ error: 'No audio data in response' }, { status: 502 });
    }

    // Convert base64 PCM to WAV
    const pcmBuffer = base64ToArrayBuffer(audioPart.data);
    const wavBuffer = pcmToWav(pcmBuffer);

    return new NextResponse(wavBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(wavBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error('TTS proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
