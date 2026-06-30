import { NextResponse } from "next/server";
import type { GenerateNewsScriptRequest, GenerateNewsScriptResponse, NewsShortsScript } from "@/types/news";
import { fallbackScript } from "@/lib/news";
import { generateJsonWithOpenAI } from "@/lib/openai";
import { buildNewsScriptPrompt } from "@/lib/prompts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateNewsScriptRequest;
    if (!body.brief || !body.sources?.length) {
      return NextResponse.json({ error: "스크립트를 만들 브리프와 출처가 필요합니다." }, { status: 400 });
    }

    const script = await generateJsonWithOpenAI<NewsShortsScript>(
      buildNewsScriptPrompt(body.brief, body.sources, body.tone, body.targetAudience, body.duration),
      () => fallbackScript(body.brief, body.sources, body.tone, body.targetAudience, body.duration)
    );
    script.youtube_metadata = {
      ...script.youtube_metadata,
      privacyStatus: script.youtube_metadata?.privacyStatus || "private",
      madeForKids: Boolean(script.youtube_metadata?.madeForKids),
      selfDeclaredMadeForKids: Boolean(script.youtube_metadata?.selfDeclaredMadeForKids)
    };

    const response: GenerateNewsScriptResponse = { script };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "뉴스 스크립트 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
