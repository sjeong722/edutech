const defaultSettings = {
  systemPrompt:
    "당신은 'AI 시대, 인간다움은 무엇일까?' 교육과정 전용 상담 챗봇입니다. 문서에 제시된 10차시 융합 교육과정을 바탕으로 학교 관리자, 교사, 학부모, 학생에게 친절하고 구체적으로 안내합니다. 답변은 생성형 AI 활용법을 넘어 비판적 사고, 디지털 시민성, 인간 고유성, 진로 성찰을 중심으로 구성합니다. 문서에 없는 운영 조건은 확정하지 말고 확인 질문으로 좁힙니다. 개인정보 입력은 요구하지 않습니다.",
  knowledgeBase:
    `교육명: AI 시대, 인간다움은 무엇일까? : 생성형 AI와 사고하는 법 / 2026 AI 기반 맞춤형 진로 설계 프로젝트.
핵심 배경: 생성형 AI가 과제 수행과 평가 방식을 바꾸고 있으므로, 교육은 단순 도구 활용을 넘어 AI와 함께 비판적으로 사고하고 검증하는 능력, 디지털 시민성, 인간 고유 역량을 길러야 한다.
운영 목적: 생성형 AI 원리 이해, 할루시네이션과 정보 교차 검증을 통한 Fact-check 역량 강화, 기술 사회 속 인간다움의 가치 재발견, 진로 탐색 결과를 꿈it(잇)다 2.0과 연계한 성장 이력 관리.
대상/시간: 중학교 재학생 20명 기준, 총 10회차, 회차당 45분. 문서 예시는 서울 빛나리 중학교 재학생 20명.
교육 방식: 블렌디드 러닝. 대면 실습/토론과 온라인 도구 활용을 결합한다. 활용 도구는 ChatGPT, Claude, Gemini 등 생성형 AI와 ThinkGym 토론 웹페이지.
10차시: 1차시 AI 기본 개념 - 생성형 AI 작동 원리와 활용 윤리 서약. 2차시 인간 고유 역할 - 오감/심리 조향 실습으로 인간 고유성 탐색. 3차시 미래 독서 토론 - 《먼저 온 미래》 기반 AI 공존 사회 비교 분석. 4차시 핵심 질문 도출 - ThinkGym을 활용한 논리적 프롬프트와 심화 질문 설계. 5차시 AI 팩트체크 - 할루시네이션 검증과 정보 교차 확인. 6차시 미래 직업 예측 - AI 대체 가능성 분석과 유망 직업 마인드맵. 7차시 논리 구조화 - 온라인 토론 플랫폼으로 주장 시각화와 논리 강화. 8차시 상호 피드백 - 동료 평가와 질문으로 비판적 사고 확장. 9차시 미래 선언서 - AI 시대 주역으로서의 나의 다짐 또는 모둠 선언서 작성. 10차시 진로 포트폴리오 - 꿈it(잇)다 2.0 데이터 업로드 및 최종 성찰.
설계 포인트: 비판적 사고, 성장 마인드셋, AI 및 인간 동료와의 협업, 감각 실습을 통한 정서 안정과 인간 고유 가치 통찰.
평가 방식: 포트폴리오 완성도 50%, 과정 참여도 30%, 자기성찰 일지 20%.
예산 예시: 1학급 20명 기준 총 3,080,000원. 강사비 1,500,000원, 심리 조향 키트 200,000원, 도서비 320,000원, ThinkGym 라이선스 300,000원, 교육과정 개발 및 워크북 700,000원, 운영관리비 60,000원.
기대 효과: 디지털 리터러시 향상, 미래 사회에 대한 능동적 태도, 선도적 디지털 인문학 교육 모델 구축, 꿈it(잇)다 2.0 학생별 진로 이력 데이터 확보, 경기공유학교 및 창의적 체험활동 확산 가능성.`
};

const DEFAULT_MODEL = "gpt-5.2";

function safeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function extractText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") parts.push(content.text);
      if (typeof content.refusal === "string") parts.push(content.refusal);
    }
  }
  return parts.join("\n").trim();
}

function buildInstructions(settings, profile) {
  const prompt = safeString(settings.systemPrompt, defaultSettings.systemPrompt);
  const knowledge = safeString(settings.knowledgeBase, defaultSettings.knowledgeBase);
  const target = safeString(profile.target, "미입력");
  const goal = safeString(profile.goal, "과정 개요");
  const persona = safeString(profile.persona, "student");
  const needs = Array.isArray(profile.needs) && profile.needs.length ? profile.needs.join(", ") : "아직 파악 중";

  return `${prompt}

상담 운영 지침:
- 한국어로 답합니다.
- 사용자의 상황을 먼저 인정하고, 문서 기반 교육과정 정보와 실행 가능한 운영 제안을 제시합니다.
- 답변은 6문장 안팎으로 간결하게 유지하되, 커리큘럼이나 예산 요청은 표처럼 읽히는 항목형으로 정리합니다.
- 문서에 없는 세부 일정, 학교명, 금액은 확정하지 말고 확인 질문을 덧붙입니다.
- 개인정보, 성적표, 연락처 등 민감정보를 요구하지 않습니다.
- 확실하지 않은 내용은 확인 질문으로 좁힙니다.

관리자 지식:
${knowledge}

현재 상담 정보:
- 대상: ${target}
- 목표: ${goal}
- 상담 모드: ${persona}
- 파악된 요구: ${needs}`;
}

function buildTranscript(history, message) {
  const recent = Array.isArray(history) ? history.slice(-8) : [];
  const lines = recent.map((turn) => {
    const role = turn.role === "bot" ? "상담봇" : "사용자";
    return `${role}: ${safeString(turn.text).slice(0, 1200)}`;
  }).filter((line) => !line.endsWith(": "));
  lines.push(`사용자: ${message}`);
  return lines.join("\n");
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({
      ok: true,
      aiEnabled: Boolean(process.env.OPENAI_API_KEY),
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const message = safeString(body.message).slice(0, 4000);
  const fallback = safeString(body.fallback, "궁금한 대상, 운영 상황, 필요한 산출물을 알려주시면 이 교육과정 기준으로 더 구체적으로 안내해드릴게요.");
  const settings = { ...defaultSettings, ...(body.settings || {}) };
  const profile = body.profile || {};

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(200).json({ reply: fallback, source: "fallback", aiEnabled: false });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions: buildInstructions(settings, profile),
        input: buildTranscript(body.history, message),
        max_output_tokens: 700
      })
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(200).json({ reply: fallback, source: "fallback", aiEnabled: true, apiError: data.error?.message || "OpenAI request failed" });
      return;
    }

    res.status(200).json({
      reply: extractText(data) || fallback,
      source: "openai",
      aiEnabled: true
    });
  } catch (error) {
    res.status(200).json({ reply: fallback, source: "fallback", aiEnabled: true, apiError: error.message });
  }
};
