# 에듀테크 커리어 에이전트 개발 계획 (Gemini API 연동)

기존에 제작한 정적 웹페이지 워크프레임을 실제 작동하는 **풀스택 웹 애플리케이션**으로 고도화하는 계획입니다. 깔끔한 폴더 구조를 유지하고, 보안을 위해 Node.js 백엔드 서버를 통해 Gemini API와 통신하도록 설계합니다.

## User Review Required

> [!IMPORTANT]
> 1. **Gemini API Key:** 백엔드 서버에서 Gemini API를 호출하기 위해 API Key가 필요합니다. 개발 단계에서 `.env` 파일에 키를 입력해 주셔야 합니다. (제가 `.env.example` 파일을 만들어 두겠습니다.)
> 2. **크롤링(Scraping) 범위:** 현재 단계에서는 채용 공고를 자동으로 수집(Scraping)하는 부분까지 완벽히 구현하기에는 외부 사이트 차단 이슈 등이 있을 수 있습니다. 따라서 **1단계(현재)**로는 사용자가 공고 내용 텍스트나 링크를 입력하면 Gemini API가 분석해서 전략을 짜주는 기능을 먼저 완성하고, **2단계**에서 스크래퍼를 연동하는 것을 제안합니다. 동의하시나요?

## Proposed Changes

### 1. 폴더 구조 개편 (Folder Restructuring)
현재 루트에 흩어져 있는 파일들을 체계적으로 분리합니다.

#### [NEW] `docs/` (문서)
- 기존 `edutech_job_agent_prompt.md` 파일을 이곳으로 이동합니다.
- 본 개발 계획 내용을 담은 추가 문서도 저장됩니다.

#### [NEW] `frontend/` (프론트엔드 리소스)
- 기존에 만든 워크프레임 파일들(`index.html`, `style.css`, `script.js`)을 이곳으로 이동합니다.

#### [NEW] `backend/` (Node.js 서버 및 API 로직)
- `package.json`: 필요한 의존성 패키지 (`express`, `cors`, `dotenv`, `@google/generative-ai`)
- `server.js`: 정적 파일(프론트엔드) 서빙 및 클라이언트 API 요청 처리 메인 서버
- `services/geminiService.js`: 기존에 작성한 **'에듀테크 채용 자동화 프롬프트'**를 System Instruction으로 설정하고 Gemini API와 통신하는 핵심 비즈니스 로직
- `.env`: API Key 등 환경 변수 저장 (Git에 올라가지 않도록 처리)

### 2. 백엔드 및 Gemini API 통합 (Backend Setup)
Gemini API 키가 브라우저에 노출되는 것을 방지하기 위해 Express 서버를 구축합니다.

#### [NEW] `backend/services/geminiService.js`
- Google Generative AI SDK를 사용하여 `gemini-1.5-flash` 또는 `gemini-1.5-pro` 모델을 초기화합니다.
- 우리가 작성했던 프롬프트를 시스템 지침으로 주입하고, 입력받은 채용 공고 데이터를 JSON 포맷으로 일관성 있게 반환받도록 파싱 로직을 구성합니다.

### 3. 프론트엔드 동적 연동 (Frontend Integration)

#### [MODIFY] `frontend/index.html` & `frontend/style.css`
- 사용자가 테스트해 볼 수 있도록 '채용 공고 내용 붙여넣기' 입력창과 'AI 전략 생성' 버튼을 UI 상단에 추가합니다.

#### [MODIFY] `frontend/script.js`
- 하드코딩되어 있던 Mock 데이터를 제거합니다.
- 'AI 전략 생성' 버튼 클릭 시, 백엔드 API (`POST /api/analyze`)를 호출하고, Gemini가 응답한 결과를 바탕으로 공고 카드와 자소서 전략 모달을 동적으로 렌더링합니다.

## Verification Plan

### Automated Tests
- 백엔드 서버를 띄우고 (`node backend/server.js`) 프론트엔드 포트에 정상 접속되는지 확인.
- Postman 또는 cURL을 이용해 `/api/analyze` 엔드포인트가 Gemini API 응답을 잘 받아오는지 테스트.

### Manual Verification
- 브라우저를 열고 UI에서 실제 에듀테크 채용 공고 텍스트를 입력 후 '생성'을 클릭했을 때, 우리가 원했던 형태로 자소서 공략법 Hook이 모달에 잘 뜨는지 확인합니다.
