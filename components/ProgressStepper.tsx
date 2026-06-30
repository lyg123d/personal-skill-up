import type { NewsGenerationStep } from "@/types/news";

const steps: Array<{ id: NewsGenerationStep; label: string }> = [
  { id: "collecting_news", label: "뉴스 수집 중" },
  { id: "news_ready", label: "뉴스 후보 준비 완료" },
  { id: "generating_brief", label: "핵심 요약 생성 중" },
  { id: "generating_script", label: "스크립트 작성 중" },
  { id: "generating_images", label: "이미지 생성 중" },
  { id: "generating_voice", label: "음성 생성 중" },
  { id: "rendering_video", label: "YouTube 업로드 준비" },
  { id: "uploaded", label: "업로드 완료" }
];

export function ProgressStepper({ current }: { current: NewsGenerationStep }) {
  const activeIndex = steps.findIndex((step) => step.id === current);
  return (
    <nav className="stepper" aria-label="진행 단계">
      {steps.map((step, index) => (
        <span
          key={step.id}
          className={index <= activeIndex || current.endsWith("ready") ? "step done" : "step"}
        >
          {step.label}
        </span>
      ))}
    </nav>
  );
}
