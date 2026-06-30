# News Shorts Studio

뉴스 키워드, 기사 URL, 직접 입력한 뉴스 텍스트를 바탕으로 YouTube Shorts용 요약 영상 제작 흐름을 제공하는 Next.js 앱입니다. 일반 창작 숏츠 생성기가 아니라 출처 기반 뉴스 요약, 팩트 체크 노트, 업로드용 메타데이터 확인에 초점을 둡니다.

## 주요 기능

- 뉴스 텍스트, 기사 URL, 키워드 입력 모드
- 출처 기반 뉴스 후보 생성
- 핵심 브리프 생성
- 사실 기반 숏츠 스크립트와 씬 타임라인 생성
- 뉴스용 안전 이미지 프롬프트 적용
- OpenAI 이미지 생성 및 TTS 연결
- 제작 패키지 JSON 다운로드
- YouTube 업로드용 제목, 설명, 태그, 공개 범위, madeForKids 편집
- Google OAuth 및 YouTube upload API route 구조

## 뉴스 입력 방식

MVP 우선순위는 직접 텍스트 붙여넣기, 기사 URL, 키워드 검색 순서입니다.

- Text: 사용자가 붙여넣은 원문을 `NewsSource`로 변환합니다.
- URL: 서버에서 기사 HTML을 가져와 제목, 매체, 발행일, 본문을 추출합니다. 사이트 구조에 따라 실패할 수 있으며 이 경우 직접 텍스트 입력을 권장합니다.
- Keyword: `NEWS_API_KEY`, `NEWS_PROVIDER` adapter를 붙일 수 있게 구조만 준비되어 있습니다. 설정이 없으면 “키워드 기반 뉴스 검색은 아직 설정되지 않았습니다. 기사 URL 또는 뉴스 텍스트를 입력해주세요.” 메시지를 반환합니다.

## OpenAI API 설정

`.env.local`에 다음 값을 설정합니다.

```env
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=gpt-4o-mini
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_TTS_MODEL=gpt-4o-mini-tts
```

키가 없으면 브리프와 스크립트는 보수적 fallback으로 동작하고, 이미지와 음성 생성은 실패 상태를 반환하되 기존 결과는 유지합니다.

## Google OAuth 설정

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
YOUTUBE_UPLOAD_SCOPE=https://www.googleapis.com/auth/youtube.upload
```

Google Cloud 설정 절차:

1. Google Cloud Console에서 프로젝트 생성
2. YouTube Data API v3 활성화
3. OAuth consent screen 설정
4. OAuth Client ID 생성
5. Authorized redirect URI 등록
6. Vercel 배포 URL 기준 callback URL 등록
7. Vercel 환경변수에 Client ID와 Secret 등록

## YouTube Data API 설정

업로드에는 `https://www.googleapis.com/auth/youtube.upload` scope가 필요합니다. `/api/auth/google/start`에서 OAuth를 시작하고, `/api/auth/google/callback`에서 서버 전용 HttpOnly 쿠키에 토큰을 저장합니다. `/api/youtube/upload`는 사용자가 편집한 메타데이터와 MP4 URL을 받아 `videos.insert`를 호출합니다.

## Vercel 배포 방법

1. GitHub 저장소를 Vercel에 연결합니다.
2. Framework Preset은 Next.js를 선택합니다.
3. Project Settings > Environment Variables에 필요한 값을 추가합니다.
4. 배포 후 Google OAuth Authorized redirect URI를 배포 도메인 기준으로 업데이트합니다.

### Vercel 환경변수

```env
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=
OPENAI_IMAGE_MODEL=
OPENAI_TTS_MODEL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
YOUTUBE_UPLOAD_SCOPE=
NEWS_API_KEY=
NEWS_PROVIDER=
```

## 로컬 실행

```bash
npm install
npm run dev
```

검증:

```bash
npm run lint
npm run build
```

## 영상 렌더링 제한 사항

Vercel 서버리스 환경에서는 긴 ffmpeg 렌더링과 대용량 파일 처리가 안정적이지 않을 수 있습니다. 현재 `/api/video/render`는 adapter 구조만 제공하며, MP4 서버 렌더러가 연결되지 않으면 제작 패키지 다운로드를 사용합니다.

추후 연결 후보:

- Remotion Lambda
- Cloud Run
- Modal
- Render API
- Supabase Edge Function
- 전용 FFmpeg worker

## YouTube 업로드 주의사항

- 업로드에는 Google OAuth 인증이 필요합니다.
- 업로드 기본값은 `private`입니다.
- 사용자가 직접 `public`으로 바꾸기 전까지 공개 업로드하지 않습니다.
- Shorts로 분류되려면 세로 또는 정사각형 비율과 길이 제한을 만족해야 합니다.
- 뉴스 콘텐츠는 업로드 전 사실 확인이 필요합니다.
- 저작권이 있는 이미지, 음악, 방송 화면을 사용하지 마세요.

## 뉴스 사실 확인 주의사항

- AI가 생성한 요약은 오류가 있을 수 있습니다.
- 업로드 전 원문 출처, 날짜, 숫자, 인명, 기업명을 확인하세요.
- 한 출처만 있는 주장은 단정하지 말고 “주장했습니다”, “밝혔습니다”처럼 표현하세요.
- 정치와 사회 이슈는 중립적으로 작성하세요.
- 원문에 없는 사실을 추가하지 마세요.
