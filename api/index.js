const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 네이버 API 차단 방지를 위한 공통 헤더
const NAVER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Referer': 'https://sports.news.naver.com/kbaseball/index',
  'Accept': 'application/json, text/plain, */*'
};

/**
 * 1. 경기 일정 및 실시간 스코어
 * GET /api/kbo?date=YYYY-MM-DD
 */
app.get('/api/kbo', async (req, res) => {
  try {
    // 1. 쿼리 파라미터에서 날짜를 가져옴
    let targetDate = req.query.date;

    // 2. 날짜 파라미터가 없으면 한국 시간(KST) 기준 오늘 날짜 계산
    if (!targetDate) {
      const now = new Date();
      // 서버 환경(보통 UTC)에 관계없이 한국 시간으로 변환 (+9시간)
      const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      targetDate = kstDate.toISOString().split('T')[0];
    }

    console.log(`[Schedule] Requesting date: ${targetDate}`);

    const response = await axios.get('https://api-gw.sports.naver.com/schedule/games', {
      params: { 
        upperCategoryId: 'kbaseball', 
        date: targetDate 
      },
      headers: NAVER_HEADERS
    });

    res.json(response.data);
  } catch (e) {
    console.error('Schedule API Error:', e.message);
    res.status(500).json({ error: "데이터를 불러오는 중 오류가 발생했습니다." });
  }
});

/**
 * 2. 경기 상세 데이터 (중계 멘트, 주자 정보 등)
 * GET /api/kbo/relay?gameId=20260510NCLG0
 */
app.get('/api/kbo/relay', async (req, res) => {
  try {
    const { gameId } = req.query;
    if (!gameId) {
      return res.status(400).json({ error: "gameId 파라미터가 필요합니다." });
    }

    const response = await axios.get(`https://api-gw.sports.naver.com/schedule/games/${gameId}/relay`, {
      headers: NAVER_HEADERS
    });

    res.json(response.data);
  } catch (e) {
    console.error('Relay API Error:', e.message);
    res.status(500).json({ error: "상세 중계 데이터를 불러올 수 없습니다." });
  }
});

/**
 * 3. 팀 순위 표
 * GET /api/kbo/rank?year=2026
 */
app.get('/api/kbo/rank', async (req, res) => {
  try {
    // 쿼리에 연도가 없으면 현재 서버 연도 사용
    const year = req.query.year || new Date().getFullYear();

    const response = await axios.get(`https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/teams`, {
      headers: NAVER_HEADERS
    });

    res.json(response.data);
  } catch (e) {
    console.error('Rank API Error:', e.message);
    res.status(500).json({ error: "순위 데이터를 불러올 수 없습니다." });
  }
});

// 서버 실행 (독립 실행 시 사용)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`KBO API Server is running on port ${PORT}`);
  });
}

module.exports = app;
