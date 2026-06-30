import type { NewsCandidate } from "@/types/news";
import { EmptyState } from "@/components/EmptyState";
import { NewsCandidateCard } from "@/components/NewsCandidateCard";

type NewsCandidateGridProps = {
  candidates: NewsCandidate[];
  selectedId?: string;
  onSelect: (candidate: NewsCandidate) => void;
};

export function NewsCandidateGrid({ candidates, selectedId, onSelect }: NewsCandidateGridProps) {
  return (
    <section className="section">
      <div className="sectionHeader">
        <p className="eyebrow">News Candidates</p>
        <h2>뉴스 후보</h2>
      </div>
      {candidates.length ? (
        <div className="candidateGrid">
          {candidates.map((candidate) => (
            <NewsCandidateCard
              key={candidate.id}
              candidate={candidate}
              selected={candidate.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="아직 뉴스 후보가 없습니다"
          description="기사 URL이나 뉴스 텍스트를 입력하면 출처 기반 후보가 여기에 표시됩니다."
        />
      )}
    </section>
  );
}
