import type { GeneratedVideo, RenderVideoRequest } from "@/types/news";

export async function renderVideoAdapter(_request: RenderVideoRequest): Promise<GeneratedVideo> {
  return {
    status: "failed",
    file_name: "news-shorts-video.mp4",
    error:
      "MP4 서버 렌더링 adapter가 아직 연결되지 않았습니다. 현재는 제작 패키지 다운로드를 사용하고, 추후 Remotion/Cloud Run/Modal 같은 외부 렌더러를 연결하세요."
  };
}
