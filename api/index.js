const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/kbo', async (req, res) => {
  try {
    // 1. 한국 시간(KST) 기준 날짜 생성
    // 서버(Vercel)의 시간대에 상관없이 한국 시간을 구합니다.
    const curr = new Date();
    const utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const kstDate = new Date(utc + KR_TIME_DIFF);
    
    // 네이버 API가 요구하는 형식: YYYY-MM-DD (하이픈 필수)
    const todayStr = kstDate.toISOString().split('T')[0];
    
    // 만약 사용자가 ?date=2026-05-10 처럼 날짜를 보냈다면 그 날짜를 사용하고, 없으면 오늘 날짜 사용
    const targetDate = req.query.date || todayStr;

    console.log('Fetching KBO data for:', targetDate);

    // 2. 네이버 API 호출
    const response = await axios.get('https://api-gw.sports.naver.com/schedule/games', {
      params: {
        upperCategoryId: 'kbaseball',
        date: targetDate
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://sports.news.naver.com/kbaseball/index',
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: 5000
    });

    // 3. 성공 응답 전송
    res.status(200).json(response.data);

  } catch (error) {
    console.error('Error details:', error.message);

    if (error.response) {
      // 네이버 측에서 에러를 뱉은 경우 (400 등)
      return res.status(error.response.status).json({
        error: "Naver API Error",
        status: error.response.status,
        data: error.response.data
      });
    }
    
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
});

// Vercel 환경을 위한 export
module.exports = app;
