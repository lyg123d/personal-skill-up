import type { GeneratedSceneImage, NewsScene } from "@/types/news";
import { EmptyState } from "@/components/EmptyState";
import { SceneCard } from "@/components/SceneCard";

type SceneTimelineProps = {
  scenes: NewsScene[];
  images: GeneratedSceneImage[];
};

export function SceneTimeline({ scenes, images }: SceneTimelineProps) {
  return (
    <section className="section">
      <div className="sectionHeader">
        <p className="eyebrow">Scene Timeline</p>
        <h2>씬별 자막, 내레이션, 이미지 프롬프트</h2>
      </div>
      {scenes.length ? (
        <div className="timeline">
          {scenes.map((scene) => (
            <SceneCard
              key={scene.scene_number}
              scene={scene}
              image={images.find((image) => image.scene_number === scene.scene_number)}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="씬이 없습니다" description="스크립트를 생성하면 씬 타임라인이 표시됩니다." />
      )}
    </section>
  );
}
