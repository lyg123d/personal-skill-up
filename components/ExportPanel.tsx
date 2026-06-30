import type { GeneratedSceneImage, GeneratedVideo, NewsBrief, NewsShortsScript, NewsSource } from "@/types/news";

type ExportPanelProps = {
  brief?: NewsBrief;
  script?: NewsShortsScript;
  sources: NewsSource[];
  images: GeneratedSceneImage[];
  video?: GeneratedVideo;
};

export function ExportPanel({ brief, script, sources, images, video }: ExportPanelProps) {
  const copy = async (value: string) => navigator.clipboard.writeText(value);
  const sourcesText = sources
    .map((source) => `- ${source.publisher || "출처"}: ${source.title}${source.url ? `\n  ${source.url}` : ""}`)
    .join("\n");

  function downloadJson() {
    const blob = new Blob([JSON.stringify({ brief, script, sources, images, video }, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "news-shorts-result.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="section">
      <div className="sectionHeader">
        <p className="eyebrow">Export</p>
        <h2>복사 및 다운로드</h2>
      </div>
      <div className="exportGrid">
        <button type="button" disabled={!brief} onClick={() => copy(JSON.stringify(brief, null, 2))}>
          뉴스 브리프 복사
        </button>
        <button type="button" disabled={!script} onClick={() => copy(script?.narration || "")}>
          스크립트 복사
        </button>
        <button
          type="button"
          disabled={!script}
          onClick={() => copy(script?.scenes.map((scene) => scene.subtitle).join("\n") || "")}
        >
          자막만 복사
        </button>
        <button type="button" disabled={!script} onClick={() => copy(script?.youtube_metadata.description || "")}>
          YouTube 설명란 복사
        </button>
        <button type="button" disabled={!sources.length} onClick={() => copy(sourcesText)}>
          출처 목록 복사
        </button>
        <button type="button" disabled={!script} onClick={downloadJson}>
          JSON 다운로드
        </button>
        {video?.video_url ? (
          <a href={video.video_url} download={video.file_name || "news-shorts-video.mp4"}>
            영상 다운로드
          </a>
        ) : null}
      </div>
    </section>
  );
}
