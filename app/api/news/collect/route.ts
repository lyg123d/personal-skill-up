import { NextResponse } from "next/server";
import type { CollectNewsRequest, CollectNewsResponse } from "@/types/news";
import { candidateFromSource, collectKeywordNews, sourceFromText, sourceFromUrl } from "@/lib/news";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CollectNewsRequest;
    const sources =
      body.mode === "text"
        ? [sourceFromText(body.text || "", body.category)]
        : body.mode === "url"
          ? [await sourceFromUrl(body.url || "")]
          : await collectKeywordNews();

    if (!sources[0]?.content?.trim()) {
      return NextResponse.json({ error: "뉴스 원문이 비어 있습니다." }, { status: 400 });
    }

    const response: CollectNewsResponse = {
      sources,
      candidates: sources.map(candidateFromSource)
    };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "뉴스 수집에 실패했습니다." },
      { status: 400 }
    );
  }
}
