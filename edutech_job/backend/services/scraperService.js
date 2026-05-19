const axios = require('axios');
const cheerio = require('cheerio');

// 검색 키워드 목록
const KEYWORDS = [
    '에듀테크 기획',
    '에듀테크 마케팅',
    '에듀테크 LMS',
    '이러닝 기획',
    '이러닝 마케팅',
    '에듀테크 콘텐츠'
];

// 사람인 스크래핑
async function scrapeSaramin(keyword) {
    const results = [];
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        // recruitSort=reg_dt → 최신순, recruitPageCount=40
        const url = `https://www.saramin.co.kr/zf_user/search/recruit?searchType=search&searchword=${encodedKeyword}&recruitPage=1&recruitSort=reg_dt&recruitPageCount=40`;

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'ko-KR,ko;q=0.9',
            },
            timeout: 10000,
        });

        const $ = cheerio.load(data);

        $('.item_recruit').each((_, el) => {
            const company = $(el).find('.corp_name a').text().trim();
            const title = $(el).find('.job_tit a').text().trim();
            const link = $(el).find('.job_tit a').attr('href');
            const fullLink = link ? `https://www.saramin.co.kr${link}` : '';

            // 채용 조건 파싱
            const conditions = [];
            $(el).find('.job_condition span').each((_, span) => {
                conditions.push($(span).text().trim());
            });

            const location = conditions[0] || '';
            const experience = conditions[1] || '';
            const education = conditions[2] || '';
            const employmentType = conditions[3] || '';

            // 마감일
            const deadline = $(el).find('.job_date .date').text().trim();

            if (company && title) {
                results.push({
                    source: '사람인',
                    company,
                    title,
                    link: fullLink,
                    location,
                    experience,
                    education,
                    employmentType,
                    deadline,
                    keyword,
                });
            }
        });
    } catch (error) {
        console.error(`[사람인 스크래핑 에러] 키워드: ${keyword}`, error.message);
    }
    return results;
}

// 원티드 API (공개 검색 API 사용)
async function scrapeWanted(keyword) {
    const results = [];
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const url = `https://www.wanted.co.kr/api/v4/jobs?query=${encodedKeyword}&country=kr&job_sort=job.latest_order&years=-1&limit=20&offset=0`;

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'ko-KR,ko;q=0.9',
            },
            timeout: 10000,
        });

        if (data && data.data) {
            data.data.forEach(job => {
                results.push({
                    source: '원티드',
                    company: job.company?.name || '',
                    title: job.position || '',
                    link: `https://www.wanted.co.kr/wd/${job.id}`,
                    location: job.address?.location || '',
                    experience: job.years_text || '',
                    education: '',
                    employmentType: '정규직', // 원티드는 기본적으로 정규직 위주
                    deadline: '',
                    keyword,
                });
            });
        }
    } catch (error) {
        console.error(`[원티드 스크래핑 에러] 키워드: ${keyword}`, error.message);
    }
    return results;
}

// 정규직 필터링
function filterFullTime(jobs) {
    return jobs.filter(job => {
        const type = job.employmentType.toLowerCase();
        const isNotFullTime = type.includes('인턴') || type.includes('계약') || type.includes('파트') || type.includes('프리랜서') || type.includes('아르바이트');
        return !isNotFullTime;
    });
}

// 서울 근무지 필터링
function filterSeoul(jobs) {
    return jobs.filter(job => {
        const loc = job.location;
        return loc.includes('서울') || loc.includes('Seoul') || loc === '';
    });
}

// 신입 ~ 3년 이하 경력 필터링
function filterExperience(jobs) {
    return jobs.filter(job => {
        const exp = job.experience;
        // 신입, 경력무관, 경력 표기 없음은 포함
        if (!exp || exp === '' || exp.includes('신입') || exp.includes('무관') || exp.includes('경력무관')) return true;
        // "N년↑" 또는 "N년 이상" 형태에서 숫자 추출
        const match = exp.match(/(\d+)/);
        if (match) {
            const years = parseInt(match[1]);
            return years <= 3; // 3년 이하만 포함
        }
        return true; // 파싱 불가한 경우 포함
    });
}

// 중복 제거 (회사명 + 포지션명 기준)
function deduplicateJobs(jobs) {
    const seen = new Set();
    return jobs.filter(job => {
        const key = `${job.company}_${job.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// 카테고리 분류 (기획, 마케팅, LMS, 콘텐츠)
function categorizeJob(job) {
    const text = `${job.title} ${job.keyword}`.toLowerCase();
    if (text.includes('lms') || text.includes('이러닝') || text.includes('플랫폼')) return 'LMS';
    if (text.includes('마케팅') || text.includes('그로스') || text.includes('퍼포먼스')) return '마케팅';
    if (text.includes('콘텐츠') || text.includes('컨텐츠') || text.includes('영상') || text.includes('크리에이')) return '콘텐츠';
    if (text.includes('기획') || text.includes('커리큘럼') || text.includes('디자인') || text.includes('pm')) return '기획';
    return '기타';
}

// 전체 스크래핑 실행
async function scrapeAllJobs() {
    console.log(`[스크래핑 시작] ${new Date().toLocaleString('ko-KR')} | 키워드: ${KEYWORDS.join(', ')}`);
    
    const allPromises = [];

    for (const keyword of KEYWORDS) {
        allPromises.push(scrapeSaramin(keyword));
        allPromises.push(scrapeWanted(keyword));
    }

    const resultsArray = await Promise.all(allPromises);
    let allJobs = resultsArray.flat();

    // 정규직 필터링
    allJobs = filterFullTime(allJobs);
    // 서울 근무지 필터링
    allJobs = filterSeoul(allJobs);
    // 신입~3년 이하 경력 필터링
    allJobs = filterExperience(allJobs);
    // 중복 제거
    allJobs = deduplicateJobs(allJobs);
    // 카테고리 분류
    allJobs = allJobs.map(job => ({
        ...job,
        category: categorizeJob(job),
        id: Math.random().toString(36).substring(2, 9),
    }));

    console.log(`[스크래핑 완료] 서울 정규직 ${allJobs.length}건 수집`);
    
    return {
        scrapedAt: new Date().toISOString(),
        totalCount: allJobs.length,
        planningCount: allJobs.filter(j => j.category === '기획').length,
        marketingCount: allJobs.filter(j => j.category === '마케팅').length,
        lmsCount: allJobs.filter(j => j.category === 'LMS').length,
        contentCount: allJobs.filter(j => j.category === '콘텐츠').length,
        jobs: allJobs,
    };
}

module.exports = { scrapeAllJobs, KEYWORDS };
