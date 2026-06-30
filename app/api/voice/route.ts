import { NextResponse } from "next/server";
import type { GenerateVoiceRequest, GenerateVoiceResponse } from "@/types/news";
import { generateSpeechWithOpenAI } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateVoiceRequest;
    try {
      const audio_url = await generateSpeechWithOpenAI(body.narration, body.voice);
      const response: GenerateVoiceResponse = { audio: { audio_url, status: "success" } };
      return NextResponse.json(response);
    } catch (error) {
      const response: GenerateVoiceResponse = {
        audio: {
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
