import type { NewsBrief } from "@/types/news";
import { EmptyState } from "@/components/EmptyState";
import { FactCheckNotes } from "@/components/FactCheckNotes";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type NewsBriefPanelProps = {
  brief?: NewsBrief;
  loading: boolean;
  disabled: boolean;
  onGenerate: () => void;
};

export function NewsBriefPanel({ brief, loading, disabled, onGenerate }: NewsBriefPanelProps) {
  return (
    <section className="section">
      <div className="sectionHeader withAction">
        <div>
          <p className="eyebrow">Brief Panel</p>
          <h2>핵심 요약</h2>
        </div>
        <button type="button" onClick={onGenerate} disabled={disabled || loading}>
          {loading ? <LoadingSpinner /> : null}
          브리프 생성
        </button>
      </div>
      {brief ? (
        <div className="briefBox">
          <h3>{brief.title}</h3>
          <p className="lead">{brief.one_line_summary}</p>
          <h4>핵심 포인트</h4>
          <ul>
            {brief.key_points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <h4>배경</h4>
          <p>{brief.background}</p>
          <h4>왜 중요한지</h4>
          <p>{brief.why_it_matters}</p>
          <FactCheckNotes notes={brief.uncertainty_notes} />
        </div>
      ) : (
        <EmptyState title="브리프가 없습니다" description="뉴스 후보를 선택한 뒤 출처 기반 핵심 요약을 생성하세요." />
      )}
    </section>
  );
}
