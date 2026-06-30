import { NextRequest, NextResponse } from "next/server";
import type { GeneratedVideo, YouTubeUploadMetadata } from "@/types/news";

export const runtime = "nodejs";

type StartUploadRequest = {
  metadata: YouTubeUploadMetadata;
  video?: Pick<GeneratedVideo, "mime_type" | "size_bytes">;
};

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("youtube_access_token")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Google OAuth 연결 후 업로드할 수 있습니다." }, { status: 401 });
    }

    const body = (await request.json()) as StartUploadRequest;
    if (!body.metadata?.title?.trim()) {
      return NextResponse.json({ error: "YouTube 제목이 필요합니다." }, { status: 400 });
    }

    const mimeType = body.video?.mime_type || "video/webm";
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": mimeType
    };
    if (body.video?.size_bytes) {
      headers["X-Upload-Content-Length"] = String(body.video.size_bytes);
    }

    const uploadSession = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers,
        body: JSON.stringify(toYouTubeResource(body.metadata))
      }
    );

    if (!uploadSession.ok) {
      const message = await uploadSession.text();
      return NextResponse.json({ error: formatYouTubeError(message) }, { status: uploadSession.status });
    }

    const uploadUrl = uploadSession.headers.get("location");
    if (!uploadUrl) {
      return NextResponse.json({ error: "YouTube 업로드 세션 URL을 받지 못했습니다." }, { status: 502 });
    }

    return NextResponse.json({ uploadUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "YouTube 업로드 세션 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

function toYouTubeResource(metadata: YouTubeUploadMetadata) {
  return {
    snippet: {
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags,
      categoryId: metadata.categoryId || "25"
    },
    status: {
      privacyStatus: metadata.privacyStatus || "private",
      madeForKids: metadata.madeForKids,
      selfDeclaredMadeForKids: metadata.selfDeclaredMadeForKids
    }
  };
}

function formatYouTubeError(message: string) {
  if (message.includes("quota")) return "YouTube API quota를 초과했습니다.";
  if (message.includes("insufficientPermissions")) return "YouTube upload 권한이 부족합니다. Google OAuth scope를 확인해주세요.";
  return message || "YouTube 업로드 세션 생성에 실패했습니다.";
}
