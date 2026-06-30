import type { GeneratedSceneImage, NewsScene } from "@/types/news";

type SceneCardProps = {
  scene: NewsScene;
  image?: GeneratedSceneImage;
};

export function SceneCard({ scene, image }: SceneCardProps) {
  return (
    <article className="sceneCard">
      <div className="scenePreview">
        {image?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.image_url} alt={scene.scene_title} />
        ) : (
          <span>{image?.status === "failed" ? "이미지 생성 실패" : "이미지 대기"}</span>
        )}
      </div>
      <div>
        <p className="sceneNumber">Scene {scene.scene_number}</p>
        <h3>{scene.scene_title}</h3>
        <p>{scene.subtitle}</p>
        <small>{scene.duration_sec}초 · {scene.source_reference || "출처 확인 필요"}</small>
        <details>
          <summary>내레이션 / 이미지 프롬프트</summary>
          <p>{scene.narration}</p>
          <code>{image?.image_prompt || scene.image_prompt}</code>
          {image?.error ? <em>{image.error}</em> : null}
        </details>
      </div>
    </article>
  );
}
