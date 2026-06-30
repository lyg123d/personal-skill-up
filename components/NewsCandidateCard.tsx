import type { NewsCandidate } from "@/types/news";

type NewsCandidateCardProps = {
  candidate: NewsCandidate;
  selected: boolean;
  onSelect: (candidate: NewsCandidate) => void;
};

export function NewsCandidateCard({ candidate, selected, onSelect }: NewsCandidateCardProps) {
  return (
    <article className={selected ? "candidateCard selected" : "candidateCard"}>
      <div className="candidateMeta">
        <span>{candidate.publisher || "매체 확인 필요"}</span>
        <span>{candidate.published_at || "발행일 확인 필요"}</span>
      </div>
      <h3>{candidate.title}</h3>
      <p>{candidate.one_line_summary}</p>
      <dl>
        <div>
          <dt>왜 중요한지</dt>
          <dd>{candidate.why_it_matters}</dd>
        </div>
        <div>
          <dt>숏츠 각도</dt>
          <dd>{candidate.shorts_angle}</dd>
        </div>
        <div>
          <dt>신뢰성 메모</dt>
          <dd>{candidate.reliability_note}</dd>
        </div>
      </dl>
      <div className="cardActions">
        {candidate.url ? (
          <a href={candidate.url} target="_blank" rel="noreferrer">
            원문 링크
          </a>
        ) : null}
        <button type="button" onClick={() => onSelect(candidate)}>
          이 뉴스로 쇼츠 만들기
        </button>
      </div>
    </article>
  );
}
