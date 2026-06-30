import type { NewsSource } from "@/types/news";

export function SourceList({ sources }: { sources: NewsSource[] }) {
  if (!sources.length) return null;
  return (
    <section className="sourceList">
      <h3>출처</h3>
      <div className="sourceRows">
        {sources.map((source) => (
          <article key={source.id} className="sourceRow">
            <strong>{source.publisher || "출처 확인 필요"}</strong>
            <span>{source.title}</span>
            <small>{source.published_at || "발행일 확인 필요"}</small>
            {source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer">
                원문 링크
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
