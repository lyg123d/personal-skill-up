import { NextResponse } from "next/server";
import type { RenderVideoRequest, RenderVideoResponse } from "@/types/news";
import { renderVideoAdapter } from "@/lib/video";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RenderVideoRequest;
    const response: RenderVideoResponse = {
      video: await renderVideoAdapter(body)
    };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "영상 렌더링 요청에 실패했습니다." },
      { status: 500 }
    );
  }
}
