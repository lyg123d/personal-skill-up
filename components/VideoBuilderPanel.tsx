import type { GeneratedSceneImage, GeneratedVideo, GeneratedVoice, NewsShortsScript } from "@/types/news";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type VideoBuilderPanelProps = {
  script?: NewsShortsScript;
  images: GeneratedSceneImage[];
  voice?: GeneratedVoice;
  video?: GeneratedVideo;
  loadingImages: boolean;
  loadingVoice: boolean;
  loadingVideo: boolean;
  onGenerateImages: () => void;
  onGenerateVoice: () => void;
  onRenderVideo: () => void;
  onDownloadPackage: () => void;
};

export function VideoBuilderPanel({
  script,
  images,
  voice,
  video,
  loadingImages,
  loadingVoice,
  loadingVideo,
  onGenerateImages,
  onGenerateVoice,
  onRenderVideo,
  onDownloadPackage
}: VideoBuilderPanelProps) {
  return (
    <section className="section">
      <div className="sectionHeader">
        <p className="eyebrow">Video Builder</p>
        <h2>이미지, 음성, 영상 패키지</h2>
      </div>
      <div className="builderGrid">
        <button type="button" onClick={onGenerateImages} disabled={!script || loadingImages}>
          {loadingImages ? <LoadingSpinner /> : null}
          씬별 이미지 생성
        </button>
        <button type="button" onClick={onGenerateVoice} disabled={!script || loadingVoice}>
          {loadingVoice ? <LoadingSpinner /> : null}
          내레이션 음성 생성
        </button>
        <button type="button" onClick={onRenderVideo} disabled={!script || loadingVideo}>
          {loadingVideo ? <LoadingSpinner /> : null}
          MP4 영상 생성
        </button>
        <button type="button" onClick={onDownloadPackage} disabled={!script}>
          제작 패키지 다운로드
        </button>
      </div>
      <div className="statusGrid">
        <span>이미지 {images.filter((image) => image.status === "success").length}/{script?.scenes.length || 0}</span>
        <span>음성 {voice?.status || "대기"}</span>
        <span>영상 {video?.status || "렌더 adapter 대기"}</span>
      </div>
      {voice?.audio_url ? <audio controls src={voice.audio_url} /> : null}
      {video?.video_url ? (
        <a className="downloadLink" href={video.video_url} download={video.file_name || "news-shorts-video.mp4"}>
          영상 다운로드
        </a>
      ) : null}
      {video?.error ? <p className="hint">{video.error}</p> : null}
    </section>
  );
}
