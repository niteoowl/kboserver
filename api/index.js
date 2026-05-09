const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/kbo', async (req, res) => {
  try {
    // 한국 시간(KST) 기준으로 날짜를 구합니다.
    const now = new Date();
    const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000)); 
    const year = kst.getUTCFullYear();
    const month = String(kst.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kst.getUTCDate()).padStart(2, '0');
    const todayStr = `${year}${month}${day}`;

    console.log('요청 날짜:', todayStr); // Vercel 로그에서 확인용

    const url = `https://api-gw.sports.naver.com/schedule/games?upperCategoryId=kbaseball&date=${todayStr}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    // 네이버에서 에러를 보냈을 경우 그 내용을 상세히 로깅
    if (error.response) {
      console.error('Naver API Error:', error.response.status, error.response.data);
    }
    res.status(500).json({ error: '데이터 요청 실패', message: error.message });
  }
});

module.exports = app;
