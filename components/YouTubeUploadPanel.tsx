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
  const [result, setResult] = useState<YouTubeUploadResult>();

  async function upload() {
    if (!video) return;
    setLoading(true);
    setResult(undefined);
    try {
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
    }
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
      <button type="button" className="primaryButton" disabled={!connected || !video?.video_url || loading} onClick={upload}>
        {loading ? <LoadingSpinner /> : null}
        YouTube Shorts로 업로드
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
