import { NextResponse } from "next/server";
import type { GenerateNewsBriefRequest, GenerateNewsBriefResponse, NewsBrief } from "@/types/news";
import { fallbackBrief } from "@/lib/news";
import { generateJsonWithOpenAI } from "@/lib/openai";
import { buildNewsBriefPrompt } from "@/lib/prompts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateNewsBriefRequest;
    if (!body.sources?.length) {
      return NextResponse.json({ error: "브리프를 만들 뉴스 출처가 없습니다." }, { status: 400 });
    }

    const brief = await generateJsonWithOpenAI<NewsBrief>(
      buildNewsBriefPrompt(body.sources, body.tone, body.targetAudience),
      () => fallbackBrief(body.sources, body.tone, body.targetAudience)
    );

    const response: GenerateNewsBriefResponse = { brief };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "뉴스 브리프 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
