import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import type { GenerateVoiceRequest, GenerateVoiceResponse } from "@/types/news";
import { generateSpeechWithLocalModel } from "@/lib/localModels";
import { generateSpeechWithExternalTTS } from "@/lib/tts";
import { createSilentAudioUrl, generateSpeechWithOpenAI, hasOpenAIKey } from "@/lib/openaiMedia";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateVoiceRequest;
    const text = getTtsInputText(body);

    if (!text) {
      const response: GenerateVoiceResponse = {
        voice: {
          status: "failed",
          error: "TTS 입력 텍스트가 비어 있습니다. script.narration 또는 scenes[].narration을 확인해주세요."
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    try {
      const audio_url = await generateSpeechAudioUrl(text, body.voice);
      const response: GenerateVoiceResponse = { voice: { audio_url, status: "success" } };
      return NextResponse.json(response);
    } catch (error) {
      const response: GenerateVoiceResponse = {
        voice: {
          status: "failed",
          error: error instanceof Error ? error.message : "음성 생성에 실패했습니다."
        }
      };
      return NextResponse.json(response);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "음성 생성 요청에 실패했습니다." },
      { status: 500 }
    );
  }
}

async function generateSpeechAudioUrl(text: string, voice?: string) {
  if (process.env.LOCAL_TTS_API_URL?.trim()) {
    try {
      const audioBuffer = await generateSpeechWithExternalTTS(text);
      return saveOrInlineAudio(audioBuffer);
    } catch (error) {
      console.error("[TTS] external API failed, falling back to local model:", error);
    }
  }

  try {
    return await generateSpeechWithLocalModel(text, voice);
  } catch (error) {
    console.error("[TTS] local model failed:", error);
  }

  if (hasOpenAIKey()) {
    try {
      return await generateSpeechWithOpenAI(text);
    } catch (error) {
      console.error("[TTS] OpenAI fallback failed:", error);
    }
  }

  return createSilentAudioUrl(estimateDurationSec(text));
}

function getTtsInputText(body: GenerateVoiceRequest) {
  const narration = body.script?.narration || body.narration;
  if (narration?.trim()) return narration.trim();

  const scenes = body.script?.scenes?.length ? body.script.scenes : body.scenes || [];
  return scenes
    .map((scene) => scene.narration)
    .filter((value): value is string => Boolean(value?.trim()))
    .join("\n")
    .trim();
}

function getGeneratedAudioDir() {
  return path.join(process.cwd(), "public", "generated", "audio");
}

async function saveOrInlineAudio(audioBuffer: Buffer) {
  try {
    await mkdir(getGeneratedAudioDir(), { recursive: true });
    const fileName = `voice-${Date.now()}.mp3`;
    const filePath = path.join(getGeneratedAudioDir(), fileName);
    await writeFile(filePath, audioBuffer);
    return `/generated/audio/${fileName}`;
  } catch {
    return `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;
  }
}

function estimateDurationSec(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return 2;
  return Math.max(2, Math.min(12, Math.ceil(clean.length / 12)));
}
