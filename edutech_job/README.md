# ✨ EduCareer AI

**에듀테크 채용 공고 자동 수집 대시보드**

> 🔗 **배포 URL:** https://edutech-career.onrender.com

에듀테크 산업 신입 취업을 준비하는 구직자를 위한 채용 공고 자동 스크래핑 대시보드입니다.  
사람인·원티드에서 키워드 기반으로 공고를 수집하고, 조건에 맞는 결과만 필터링하여 한눈에 확인할 수 있습니다.

---

## 📌 주요 기능

| 기능 | 설명 |
|---|---|
| **자동 스크래핑** | 사람인 + 원티드에서 6개 키워드로 채용 공고 자동 수집 |
| **3단 필터링** | ① 서울 지역 → ② 정규직 → ③ 신입~3년 이하 경력 |
| **카테고리 분류** | 기획 / 마케팅 / LMS / 콘텐츠 4개 카테고리 자동 분류 |
| **원클릭 이동** | 공고 보기 버튼 클릭 시 원본 채용 사이트로 바로 이동 |
| **1시간 캐싱** | 동일 요청 시 캐시 반환으로 빠른 응답 + 외부 사이트 부하 최소화 |

## 🔑 검색 키워드

`에듀테크 기획` `에듀테크 마케팅` `에듀테크 LMS` `이러닝 기획` `이러닝 마케팅` `에듀테크 콘텐츠`

---

## 🛠 기술 스택

| 영역 | 기술 |
|---|---|
| Backend | Node.js · Express |
| Scraping | Axios · Cheerio |
| AI (추후 활성화) | Google Gemini 2.5 Flash |
| Frontend | Vanilla HTML/CSS/JS · Bento Grid 레이아웃 |
| 배포 | Render (Free Tier) · GitHub 연동 자동 배포 |

## 📁 프로젝트 구조

```
├── backend/
│   ├── server.js              # Express API 서버 (스크래핑/분석 엔드포인트)
│   └── services/
│       ├── scraperService.js   # 사람인·원티드 크롤링 + 필터링
│       └── geminiService.js    # Gemini AI 자소서 전략 분석
├── frontend/
│   ├── index.html              # Bento Grid 대시보드 UI
│   ├── style.css               # Apple 위젯 스타일 디자인
│   └── script.js               # 데이터 로딩, 필터, 렌더링
├── docs/                       # AI 프롬프트 정의서
├── .env                        # 환경변수 (Git 미포함)
└── package.json
```

---

## 🐛 트러블슈팅

### 1. Gemini 모델 404 에러
- **문제:** `gemini-1.5-flash` → `gemini-2.0-flash` → `gemini-2.0-flash-lite` 모두 404 반환
- **원인:** Google이 구버전 모델을 신규 API Key 사용자에게 비활성화
- **해결:** ListModels API(`/v1beta/models`)로 사용 가능 모델 조회 후 `gemini-2.5-flash`로 변경

### 2. dotenv 환경변수 로드 실패
- **문제:** `GEMINI_API_KEY`가 `undefined`로 로드됨
- **원인:** `dotenvx`가 기본 dotenv를 가로채면서 서브디렉토리 경로 충돌
- **해결:** 명시적 경로 + override 옵션 적용
  ```js
  require('dotenv').config({ path: '../../.env', override: true })
  ```

### 3. Render 배포 시 API Key 누락
- **문제:** Render 환경에서 Gemini API 호출 실패
- **원인:** `.env`가 `.gitignore`에 포함되어 GitHub → Render로 전달되지 않음
- **해결:** Render 대시보드 → Environment Variables에서 직접 등록

### 4. 스크래핑 결과 과다 (관련성 낮은 공고 포함)
- **문제:** 전국 모든 고용형태의 공고가 무차별 표시됨
- **원인:** 스크래핑 후 별도 필터링 로직이 없었음
- **해결:** 3단계 필터 파이프라인 구축
  ```
  전체 결과 → filterFullTime() → filterSeoul() → filterExperience()
  ```

---

## 🚀 로컬 실행 방법

```bash
git clone https://github.com/sjeong722/edutech.git
cd edutech
npm install

# .env 파일 생성
echo "PORT=3000" > .env
echo "GEMINI_API_KEY=your_key_here" >> .env

npm start
# → http://localhost:3000
```

---

## 📝 향후 개선 예정

- [ ] Gemini API 할당량 확보 후 자소서 전략 기능 재활성화
- [ ] `node-cron`을 이용한 정기 스크래핑 스케줄링 (매일 오전 8시)
- [ ] 공고 데이터 DB 저장 (SQLite or MongoDB)