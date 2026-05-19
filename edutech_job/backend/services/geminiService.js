const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), override: true });

// Load System Prompt from markdown file
const promptPath = path.join(__dirname, '../../docs/edutech_job_agent_prompt.md');
const systemInstruction = fs.readFileSync(promptPath, 'utf-8');

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
console.log(`[Gemini] API Key 로드: ${apiKey ? '✅ 성공' : '❌ 실패'}`);

async function analyzeJobPosting(jobText) {
    if (!genAI) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemInstruction,
    });

    const prompt = `다음 채용 공고 정보를 분석하여, 에듀테크 신입 지원자를 위한 자소서 전략을 아래 JSON 형식으로 반환해주세요. 반드시 JSON만 출력하고 다른 텍스트는 포함하지 마세요.

{
  "company": "회사명",
  "title": "포지션명",
  "category": "기획 또는 마케팅 또는 LMS 또는 콘텐츠",
  "summary": "핵심 직무 1줄 요약",
  "tags": ["정규직", "카테고리", "경력조건"],
  "strategy": {
    "target": "이 회사가 현재 겪고 있는 문제와 필요로 하는 인재상을 2~3문장으로 분석",
    "experience": "신입 지원자가 어필해야 할 관련 경험/역량을 2~3문장으로 조언",
    "hook": "자소서 첫 문장으로 쓸 수 있는 매력적인 도입부 1문장"
  }
}

채용 공고 정보:
${jobText}`;
    
    try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        // JSON 블록만 추출 (```json ... ``` 감싸진 경우 처리)
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)```/) || responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            responseText = jsonMatch[1] || jsonMatch[0];
        }
        return JSON.parse(responseText.trim());
    } catch (error) {
        console.error("Gemini API Error:", error.message || error);
        throw error;
    }
}

module.exports = { analyzeJobPosting };
