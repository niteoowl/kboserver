const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// 공통 헤더 설정 (네이버 차단 방지)
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
    const now = new Date();
    const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const todayStr = kst.toISOString().split('T')[0];
    const targetDate = req.query.date || todayStr;

    const response = await axios.get('https://api-gw.sports.naver.com/schedule/games', {
      params: { upperCategoryId: 'kbaseball', date: targetDate },
      headers: NAVER_HEADERS
    });
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * 2. 경기 상세 데이터 (중계 멘트, 주자 정보 등)
 * GET /api/kbo/relay?gameId=20260509NCLG0
 */
app.get('/api/kbo/relay', async (req, res) => {
  try {
    const { gameId } = req.query;
    if (!gameId) return res.status(400).json({ error: "gameId가 필요합니다." });

    const response = await axios.get(`https://api-gw.sports.naver.com/schedule/games/${gameId}/relay`, {
      headers: NAVER_HEADERS
    });
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * 3. 팀 순위 표
 * GET /api/kbo/rank?year=2026
 */
app.get('/api/kbo/rank', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const response = await axios.get(`https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/teams`, {
      headers: NAVER_HEADERS
    });
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = app;
