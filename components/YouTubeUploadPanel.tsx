"use client";

import { useState } from "react";
import type { GeneratedVideo, YouTubeUploadMetadata, YouTubeUploadResult } from "@/types/news";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type YouTubeUploadPanelProps = {
  connected: boolean;
  video?: GeneratedVideo;
  metadata?: YouTubeUploadMetadata;
  sourceSummary?: string;
};

const defaultMetadata: YouTubeUploadMetadata = {
  title: "",
  description: "출처:\n- 원문 출처를 확인해주세요.",
  tags: ["뉴스", "뉴스요약", "Shorts", "브리핑"],
  privacyStatus: "private",
  madeForKids: false,
  selfDeclaredMadeForKids: false
};

export function YouTubeUploadPanel({ connected, video, metadata, sourceSummary }: YouTubeUploadPanelProps) {
  const [form, setForm] = useState<YouTubeUploadMetadata>({
    ...defaultMetadata,
    ...metadata,
    description:
      metadata?.description ||
      `출처:\n${sourceSummary || "- 출처 확인 필요"}\n\nAI가 생성한 요약은 오류가 있을 수 있습니다.`
  });
  const [loading, setLoading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState("");
  const [result, setResult] = useState<YouTubeUploadResult>();
  const uploadReady = Boolean(video?.blob || video?.video_url);

  async function upload() {
    if (!video) return;
    setLoading(true);
    setUploadPhase("");
    setResult(undefined);
    try {
      if (video.blob) {
        await uploadRenderedBlob(video.blob);
        return;
      }
      setUploadPhase("원격 영상 URL을 YouTube로 전송 중");
      const response = await fetch("/api/youtube/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video, metadata: form })
      });
      const payload = (await response.json()) as { result: YouTubeUploadResult };
      setResult(payload.result);
    } catch (error) {
      setResult({ status: "failed", error: error instanceof Error ? error.message : "업로드 실패" });
    } finally {
      setLoading(false);
      setUploadPhase("");
    }
  }

  async function uploadRenderedBlob(blob: Blob) {
    const mimeType = video?.mime_type || blob.type || "video/webm";
    setUploadPhase("YouTube 업로드 세션 생성 중");
    const sessionResponse = await fetch("/api/youtube/upload/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadata: form,
        video: {
          mime_type: mimeType,
          size_bytes: video?.size_bytes || blob.size
        }
      })
    });
    const session = (await sessionResponse.json()) as { uploadUrl?: string; error?: string };
    if (!sessionResponse.ok || !session.uploadUrl) {
      throw new Error(session.error || "YouTube 업로드 세션 생성 실패");
    }

    setUploadPhase("영상 파일 업로드 중");
    const uploadResponse = await fetch(session.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": mimeType },
      body: blob
    });
    const text = await uploadResponse.text();
    if (!uploadResponse.ok) {
      throw new Error(readYouTubeUploadError(text));
    }
    const uploaded = text ? (JSON.parse(text) as { id?: string }) : {};
    setResult({
      status: "success",
      videoId: uploaded.id,
      videoUrl: uploaded.id ? `https://www.youtube.com/watch?v=${uploaded.id}` : undefined
    });
  }

  return (
    <section className="section uploadPanel">
      <div className="sectionHeader">
        <p className="eyebrow">YouTube Upload Panel</p>
        <h2>YouTube Shorts 업로드</h2>
      </div>
      <div className="connectionRow">
        <span className={connected ? "connected" : "disconnected"}>
          Google 연결 상태: {connected ? "연결됨" : "연결 필요"}
        </span>
        <a href="/api/auth/google/start">Google 계정 연결</a>
      </div>
      {video?.video_url ? <video className="uploadPreview" controls src={video.video_url} /> : null}
      {video?.blob ? (
        <p className="hint">
          생성 영상 준비됨: {video.file_name || "news-shorts-video.webm"} · {Math.round(blobSizeMb(video.blob))}MB
        </p>
      ) : null}
      <div className="formGrid">
        <label className="field wide">
          <span>제목</span>
          <input value={form.title} maxLength={100} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </label>
        <label className="field wide">
          <span>설명</span>
          <textarea
            value={form.description}
            rows={7}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>
        <label className="field">
          <span>태그</span>
          <input
            value={form.tags.join(", ")}
            onChange={(event) =>
              setForm({
                ...form,
                tags: event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              })
            }
          />
        </label>
        <label className="field">
          <span>공개 범위</span>
          <select
            value={form.privacyStatus}
            onChange={(event) =>
              setForm({ ...form, privacyStatus: event.target.value as YouTubeUploadMetadata["privacyStatus"] })
            }
          >
            <option value="private">private</option>
            <option value="unlisted">unlisted</option>
            <option value="public">public</option>
          </select>
        </label>
        <label className="checkField">
          <input
            type="checkbox"
            checked={form.madeForKids}
            onChange={(event) =>
              setForm({
                ...form,
                madeForKids: event.target.checked,
                selfDeclaredMadeForKids: event.target.checked
              })
            }
          />
          Yes, made for kids
        </label>
      </div>
      <button type="button" className="primaryButton" disabled={!connected || !uploadReady || loading} onClick={upload}>
        {loading ? <LoadingSpinner /> : null}
        {loading ? uploadPhase || "업로드 중" : "YouTube Shorts로 업로드"}
      </button>
      {result?.videoUrl ? (
        <a className="downloadLink" href={result.videoUrl} target="_blank" rel="noreferrer">
          업로드 완료 URL
        </a>
      ) : null}
      {result?.error ? <p className="hint">{result.error}</p> : null}
    </section>
  );
}

function blobSizeMb(blob: Blob) {
  return blob.size / 1024 / 1024;
}

function readYouTubeUploadError(text: string) {
  if (!text) return "YouTube 업로드에 실패했습니다.";
  try {
    const payload = JSON.parse(text) as { error?: { message?: string } };
    return payload.error?.message || text;
  } catch {
    return text;
  }
}
