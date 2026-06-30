import type { NewsShortsScript } from "@/types/news";
import { EmptyState } from "@/components/EmptyState";
import { FactCheckNotes } from "@/components/FactCheckNotes";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type NewsScriptPanelProps = {
  script?: NewsShortsScript;
  loading: boolean;
  disabled: boolean;
  onGenerate: () => void;
};

export function NewsScriptPanel({ script, loading, disabled, onGenerate }: NewsScriptPanelProps) {
  return (
    <section className="section">
      <div className="sectionHeader withAction">
        <div>
          <p className="eyebrow">Script Panel</p>
          <h2>숏츠 스크립트</h2>
        </div>
        <button type="button" onClick={onGenerate} disabled={disabled || loading}>
          {loading ? <LoadingSpinner /> : null}
          스크립트 생성
        </button>
      </div>
      {script ? (
        <div className="scriptBox">
          <h3>{script.title}</h3>
          <p className="lead">{script.hook}</p>
          <div className="metricRow">
            <span>{script.total_duration_sec}초</span>
            <span>{script.scenes.length} scenes</span>
            <span>privacy: {script.youtube_metadata.privacyStatus}</span>
          </div>
          <h4>내레이션</h4>
          <pre>{script.narration}</pre>
          <FactCheckNotes notes={script.fact_check_notes} />
        </div>
      ) : (
        <EmptyState title="스크립트가 없습니다" description="브리프를 바탕으로 사실 기반 숏츠 스크립트를 생성하세요." />
      )}
    </section>
  );
}
