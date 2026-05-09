const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// 공통 헤더 설정 (네이버 차단 방지 및 데이터 최신화)
const NAVER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Referer': 'https://sports.news.naver.com/kbaseball/index',
  'Accept': 'application/json, text/plain, */*',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

/**
 * 한국 시간(KST) 날짜 문자열 생성 함수 (YYYY-MM-DD)
 */
const getKSTDate = () => {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date()).replace(/\. /g, '-').replace('.', '');
};

/**
 * 1. 경기 일정 및 실시간 스코어
 * GET /api/kbo?date=YYYY-MM-DD
 */
app.get('/api/kbo', async (req, res) => {
  // 브라우저 캐시 방지 헤더 설정
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  try {
    const todayStr = getKSTDate();
    const targetDate = req.query.date || todayStr;

    const response = await axios.get('https://api-gw.sports.naver.com/schedule/games', {
      params: { 
        upperCategoryId: 'kbaseball', 
        date: targetDate,
        _t: Date.now() // API 서버 캐시 방지를 위한 타임스탬프
      },
      headers: NAVER_HEADERS,
      timeout: 5000 // 5초 타임아웃 설정
    });

    res.json(response.data);
  } catch (e) {
    console.error('KBO Schedule Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

/**
 * 2. 경기 상세 데이터 (중계 멘트, 주자 정보 등)
 * GET /api/kbo/relay?gameId=20260509NCLG0
 */
app.get('/api/kbo/relay', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const { gameId } = req.query;
    if (!gameId) return res.status(400).json({ error: "gameId가 필요합니다." });

    const response = await axios.get(`https://api-gw.sports.naver.com/schedule/games/${gameId}/relay`, {
      params: { _t: Date.now() },
      headers: NAVER_HEADERS
    });

    res.json(response.data);
  } catch (e) {
    console.error('KBO Relay Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

/**
 * 3. 팀 순위 표
 * GET /api/kbo/rank?year=2026
 */
app.get('/api/kbo/rank', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const currentYear = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric'
    }).format(new Date());
    
    const year = req.query.year || currentYear;

    const response = await axios.get(`https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/teams`, {
      params: { _t: Date.now() },
      headers: NAVER_HEADERS
    });

    res.json(response.data);
  } catch (e) {
    console.error('KBO Rank Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// 모듈로 내보내거나 직접 실행
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`KBO API Server running on port ${PORT}`);
  });
}

module.exports = app;
