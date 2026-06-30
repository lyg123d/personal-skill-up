import { NextRequest, NextResponse } from "next/server";
import type { UploadToYouTubeRequest, UploadToYouTubeResponse } from "@/types/news";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("youtube_access_token")?.value;
    if (!accessToken) {
      const response: UploadToYouTubeResponse = {
        result: { status: "failed", error: "Google OAuth 연결 후 업로드할 수 있습니다." }
      };
      return NextResponse.json(response, { status: 401 });
    }

    const body = (await request.json()) as UploadToYouTubeRequest;
    if (!body.video?.video_url) {
      const response: UploadToYouTubeResponse = {
        result: { status: "failed", error: "업로드할 MP4 영상 URL이 없습니다." }
      };
      return NextResponse.json(response, { status: 400 });
    }

    const metadata = {
      snippet: {
        title: body.metadata.title,
        description: body.metadata.description,
        tags: body.metadata.tags,
        categoryId: body.metadata.categoryId || "25"
      },
      status: {
        privacyStatus: body.metadata.privacyStatus || "private",
        madeForKids: body.metadata.madeForKids,
        selfDeclaredMadeForKids: body.metadata.selfDeclaredMadeForKids
      }
    };

    const videoResponse = await fetch(body.video.video_url);
    if (!videoResponse.ok) {
      throw new Error("영상 파일을 가져오지 못했습니다.");
    }
    const videoBlob = await videoResponse.blob();
    const boundary = `news-shorts-${crypto.randomUUID()}`;
    const multipartBody = await buildMultipartBody(boundary, metadata, videoBlob);

    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      }
    );

    if (!uploadResponse.ok) {
      const message = await uploadResponse.text();
      throw new Error(message.includes("quota") ? "YouTube API quota를 초과했습니다." : message);
    }

    const payload = (await uploadResponse.json()) as { id?: string };
    const response: UploadToYouTubeResponse = {
      result: {
        status: "success",
        videoId: payload.id,
        videoUrl: payload.id ? `https://www.youtube.com/watch?v=${payload.id}` : undefined
      }
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: UploadToYouTubeResponse = {
      result: {
        status: "failed",
        error: error instanceof Error ? error.message : "YouTube 업로드에 실패했습니다."
      }
    };
    return NextResponse.json(response, { status: 500 });
  }
}

async function buildMultipartBody(boundary: string, metadata: unknown, videoBlob: Blob) {
  const encoder = new TextEncoder();
  const metaPart = encoder.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`
  );
  const mediaHeader = encoder.encode(`--${boundary}\r\nContent-Type: video/mp4\r\n\r\n`);
  const media = new Uint8Array(await videoBlob.arrayBuffer());
  const end = encoder.encode(`\r\n--${boundary}--`);
  const body = new Uint8Array(metaPart.length + mediaHeader.length + media.length + end.length);
  body.set(metaPart, 0);
  body.set(mediaHeader, metaPart.length);
  body.set(media, metaPart.length + mediaHeader.length);
  body.set(end, metaPart.length + mediaHeader.length + media.length);
  return body;
}
