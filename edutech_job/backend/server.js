const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { analyzeJobPosting } = require('./services/geminiService');
const { scrapeAllJobs } = require('./services/scraperService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// 캐시: 스크래핑 결과를 메모리에 저장 (서버 재시작 시 초기화)
let cachedJobs = null;
let lastScrapedAt = null;

// API: 채용 공고 스크래핑 (자동)
app.get('/api/jobs', async (req, res) => {
    try {
        const forceRefresh = req.query.refresh === 'true';
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // 캐시가 없거나, 1시간 이상 지났거나, 강제 새로고침인 경우에만 스크래핑
        if (!cachedJobs || !lastScrapedAt || lastScrapedAt < oneHourAgo || forceRefresh) {
            console.log('[스크래핑] 새로운 데이터를 수집합니다...');
            cachedJobs = await scrapeAllJobs();
            lastScrapedAt = now;
        } else {
            console.log('[캐시] 기존 데이터를 반환합니다.');
        }

        res.json({ success: true, data: cachedJobs });
    } catch (error) {
        console.error('스크래핑 API Error:', error);
        res.status(500).json({ success: false, error: '채용 공고 수집 중 오류가 발생했습니다.' });
    }
});

// API: 특정 공고에 대한 Gemini AI 자소서 전략 분석
app.post('/api/analyze', async (req, res) => {
    try {
        const { jobText } = req.body;
        
        if (!jobText) {
            return res.status(400).json({ error: '채용 공고 텍스트를 입력해주세요.' });
        }

        const analysisResult = await analyzeJobPosting(jobText);
        res.json({ success: true, data: analysisResult });
    } catch (error) {
        console.error('Gemini API Error:', error.message || error);
        res.status(500).json({ success: false, error: `AI 분석 중 오류: ${error.message || error}` });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`📡 접속 후 자동으로 채용 공고를 스크래핑합니다.`);
});
