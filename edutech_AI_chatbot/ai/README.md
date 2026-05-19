# AI 시대, 인간다움 교육과정 챗봇

Vercel 서버리스 함수(`/api/chat`)에서 OpenAI Responses API를 호출하는 'AI 시대, 인간다움은 무엇일까?' 교육과정 상담 챗봇입니다. API 키는 브라우저에 넣지 말고 서버 환경변수로만 설정하세요.

## Vercel 환경변수

Vercel 프로젝트 Settings → Environment Variables에 아래 값을 추가합니다.

```text
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-5.2
```

`OPENAI_MODEL`은 선택값입니다. 비워두면 기본값 `gpt-5.2`를 사용합니다.

환경변수를 추가한 뒤에는 Production 배포를 다시 실행해야 `/api/chat`에서 새 값을 읽습니다.

## 로컬 실행

```bash
cp .env.example .env.local
npm run local
```

브라우저에서 `http://localhost:3000`을 열고, 관리자 화면의 `AI 상태 확인` 버튼으로 연결 상태를 확인합니다.

## 연결 확인

배포 후 아래 주소가 `aiEnabled: true`를 반환하면 OpenAI API 키가 서버에 정상 연결된 상태입니다.

```text
https://ai-virid-mu.vercel.app/api/chat
```

키가 없거나 OpenAI 요청이 실패하면 챗봇은 규칙 기반 fallback 답변으로 계속 동작합니다.
