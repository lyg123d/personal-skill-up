export function HeroSection() {
  return (
    <section className="hero" id="top">
      <div className="heroMedia" aria-hidden="true">
        <div className="newsPhone">
          <span />
          <strong>LIVE</strong>
          <p>60s Brief</p>
        </div>
      </div>
      <div className="heroCopy">
        <div className="badgeRow">
          <span>Source-based</span>
          <span>YouTube Shorts Ready</span>
          <span>Fact-aware Script</span>
        </div>
        <h2>뉴스 하나로 숏츠 요약 영상까지</h2>
        <p>
          기사 URL이나 뉴스 키워드를 입력하면 AI가 핵심 사실을 요약하고, 숏츠 스크립트, 씬 이미지,
          내레이션, 업로드용 메타데이터까지 생성합니다.
        </p>
        <div className="heroActions">
          <a href="#news-input" className="primaryLink">
            뉴스 쇼츠 만들기
          </a>
          <button
            type="button"
            className="secondaryButton"
            onClick={() => window.dispatchEvent(new CustomEvent("load-demo-news"))}
          >
            예시 뉴스 브리핑 보기
          </button>
        </div>
      </div>
    </section>
  );
}
