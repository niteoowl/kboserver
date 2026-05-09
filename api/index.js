const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/kbo', async (req, res) => {
  try {
    // 1. 날짜 구하기 (가장 안전한 방식)
    const kstNow = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
    const todayStr = kstNow.toISOString().split('T')[0].replace(/-/g, ''); 
    // 결과 예시: "20260509"

    console.log('--- 요청 시작 ---');
    console.log('Target Date:', todayStr);

    // 2. 네이버 API 호출
    const url = `https://api-gw.sports.naver.com/schedule/games?upperCategoryId=kbaseball&date=${todayStr}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://sports.news.naver.com/kbaseball/index',
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: 5000
    });

    console.log('Naver Response Status:', response.status);
    
    // 3. 데이터 반환
    res.status(200).json(response.data);

  } catch (error) {
    // 4. 에러 상세 로깅
    if (error.response) {
      // 네이버가 응답은 줬지만 에러인 경우 (400, 403 등)
      console.error('Naver Error Data:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      // 아예 요청조차 실패한 경우
      console.error('Request Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }
});

module.exports = app;
