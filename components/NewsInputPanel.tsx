import type { NewsCategory, NewsInputMode, NewsTone, TargetAudience, VideoDuration } from "@/types/news";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const categories: NewsCategory[] = ["전체", "정치", "경제", "사회", "국제", "기술", "AI", "과학", "문화", "스포츠"];
const tones: NewsTone[] = ["중립 브리핑", "쉽게 설명", "긴급 속보", "팩트 체크", "학생용 설명", "투자자 관점", "테크 분석"];
const audiences: TargetAudience[] = ["일반인", "중학생", "고등학생", "대학생", "직장인", "개발자", "투자 관심자"];
const durations: VideoDuration[] = [30, 45, 60, 90, 120, 180];

type NewsInputPanelProps = {
  mode: NewsInputMode;
  keyword: string;
  url: string;
  text: string;
  category: NewsCategory;
  tone: NewsTone;
  targetAudience: TargetAudience;
  duration: VideoDuration;
  loading: boolean;
  onChange: (patch: Partial<NewsInputPanelProps>) => void;
  onCollect: () => void;
};

export function NewsInputPanel({
  mode,
  keyword,
  url,
  text,
  category,
  tone,
  targetAudience,
  duration,
  loading,
  onChange,
  onCollect
}: NewsInputPanelProps) {
  return (
    <section className="section inputPanel" id="news-input">
      <div className="sectionHeader">
        <p className="eyebrow">News Input Panel</p>
        <h2>뉴스 입력</h2>
      </div>
      <div className="segmented">
        {(["text", "url", "keyword"] as NewsInputMode[]).map((item) => (
          <button
            key={item}
            type="button"
            className={mode === item ? "active" : ""}
            onClick={() => onChange({ mode: item })}
          >
            {item === "text" ? "Text" : item === "url" ? "URL" : "Keyword"}
          </button>
        ))}
      </div>
      {mode === "text" ? (
        <label className="field wide">
          <span>뉴스 원문 또는 요약 텍스트</span>
          <textarea
            value={text}
            rows={8}
            placeholder="뉴스 원문, 보도자료, 기사 요약을 붙여넣으세요."
            onChange={(event) => onChange({ text: event.target.value })}
          />
        </label>
      ) : null}
      {mode === "url" ? (
        <label className="field wide">
          <span>기사 URL</span>
          <input
            value={url}
            placeholder="https://news.example.com/article"
            onChange={(event) => onChange({ url: event.target.value })}
          />
        </label>
      ) : null}
      {mode === "keyword" ? (
        <label className="field wide">
          <span>뉴스 키워드</span>
          <input
            value={keyword}
            placeholder="AI, 반도체, 환율, 글로벌 증시"
            onChange={(event) => onChange({ keyword: event.target.value })}
          />
          <small>키워드 검색 API가 없으면 URL 또는 텍스트 입력을 사용합니다.</small>
        </label>
      ) : null}
      <div className="formGrid">
        <label className="field">
          <span>뉴스 카테고리</span>
          <select value={category} onChange={(event) => onChange({ category: event.target.value as NewsCategory })}>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>톤</span>
          <select value={tone} onChange={(event) => onChange({ tone: event.target.value as NewsTone })}>
            {tones.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>영상 길이</span>
          <select
            value={duration}
            onChange={(event) => onChange({ duration: Number(event.target.value) as VideoDuration })}
          >
            {durations.map((item) => (
              <option key={item} value={item}>
                {item}초
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>타겟</span>
          <select
            value={targetAudience}
            onChange={(event) => onChange({ targetAudience: event.target.value as TargetAudience })}
          >
            {audiences.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <button className="primaryButton" type="button" onClick={onCollect} disabled={loading}>
        {loading ? <LoadingSpinner /> : null}
        뉴스 후보 가져오기
      </button>
    </section>
  );
}
