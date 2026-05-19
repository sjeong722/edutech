let allJobs = [];

document.addEventListener('DOMContentLoaded', () => {
    const jobListContainer = document.getElementById('job-list');
    const loadingState = document.getElementById('loading-state');
    const jobListSection = document.getElementById('job-list-section');
    const emptyState = document.getElementById('empty-state');
    const modal = document.getElementById('strategy-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const refreshBtn = document.getElementById('refresh-btn');

    // Date
    const dateEl = document.getElementById('current-date');
    const now = new Date();
    const days = ['일','월','화','수','목','금','토'];
    dateEl.textContent = `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;

    fetchJobs();
    refreshBtn.addEventListener('click', () => fetchJobs(true));

    async function fetchJobs(forceRefresh = false) {
        loadingState.style.display = 'flex';
        jobListSection.style.display = 'none';
        emptyState.style.display = 'none';
        try {
            const url = forceRefresh ? '/api/jobs?refresh=true' : '/api/jobs';
            const res = await fetch(url);
            const result = await res.json();
            if (result.success && result.data) {
                allJobs = result.data.jobs || [];
                updateSummary(result.data);
                renderJobs(allJobs);
            } else { showEmpty(); }
        } catch (err) { console.error(err); showEmpty(); }
    }

    function updateSummary(d) {
        document.getElementById('count-total').textContent = d.totalCount;
        document.getElementById('count-planning').textContent = d.planningCount;
        document.getElementById('count-marketing').textContent = d.marketingCount;
        document.getElementById('count-lms').textContent = d.lmsCount;
        document.getElementById('count-content').textContent = d.contentCount;
    }

    function showEmpty() {
        loadingState.style.display = 'none';
        jobListSection.style.display = 'none';
        emptyState.style.display = 'block';
    }

    function renderJobs(jobs) {
        loadingState.style.display = 'none';
        emptyState.style.display = 'none';
        if (jobs.length === 0) { showEmpty(); return; }
        jobListSection.style.display = 'block';
        jobListContainer.innerHTML = '';
        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <div class="job-info">
                    <div class="job-meta">
                        <span class="tag tag-source">${job.source}</span>
                        <span class="tag tag-fulltime">정규직</span>
                        <span class="tag tag-role">${job.category}</span>
                        ${job.experience ? `<span class="tag tag-experience">${job.experience}</span>` : ''}
                    </div>
                    <div class="job-company">${job.company}</div>
                    <h4 class="job-title">${job.title}</h4>
                    <div class="job-details">
                        ${job.location ? `<span>${job.location}</span>` : ''}
                        ${job.deadline ? `<span>마감 ${job.deadline}</span>` : ''}
                        ${job.keyword ? `<span>${job.keyword}</span>` : ''}
                    </div>
                </div>
                <div class="job-actions">
                    <a href="${job.link}" target="_blank" class="btn-link">공고 보기 ↗</a>
                </div>`;
            jobListContainer.appendChild(card);
        });
    }

    // Filters
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const f = pill.dataset.filter;
            renderJobs(f === '전체' ? allJobs : allJobs.filter(j => j.category === f));
        });
    });
});
