import type { GeneratedSceneImage, NewsShortsScript } from "@/types/news";

type ShortsPreviewProps = {
  script?: NewsShortsScript;
  images: GeneratedSceneImage[];
};

export function ShortsPreview({ script, images }: ShortsPreviewProps) {
  const firstScene = script?.scenes[0];
  const firstImage = images.find((image) => image.scene_number === firstScene?.scene_number);

  return (
    <section className="section previewSection">
      <div className="sectionHeader">
        <p className="eyebrow">9:16 Preview</p>
        <h2>숏츠 미리보기</h2>
      </div>
      <div className="phonePreview">
        {firstImage?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={firstImage.image_url} alt={firstScene?.scene_title || "shorts preview"} />
        ) : null}
        <div className="previewOverlay">
          <strong>{script?.hook || "뉴스 핵심 훅이 여기에 표시됩니다"}</strong>
          <span>{firstScene?.subtitle || "자막 미리보기"}</span>
        </div>
      </div>
      <p className="safeNote">
        AI가 생성한 요약은 오류가 있을 수 있습니다. 업로드 전 원문 출처와 사실관계를 반드시 확인하세요.
      </p>
    </section>
  );
}
