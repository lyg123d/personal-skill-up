import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "News Shorts Studio",
  description: "뉴스 하나로 숏츠 요약 영상까지 만드는 출처 기반 제작 스튜디오"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
