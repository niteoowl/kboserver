const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/kbo', async (req, res) => {
  try {
    // 1. 서버 시간 무관하게 한국 시간으로 날짜 고정 (YYYYMMDD)
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    
    const y = kstDate.getUTCFullYear();
    const m = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(kstDate.getUTCDate()).padStart(2, '0');
    const todayStr = `${y}${m}${d}`;

    console.log('Final Request Date:', todayStr);

    // 2. 네이버 API 주소 - 파라미터를 주소창에 직접 때려박음 (400 에러 방지)
    const url = `https://api-gw.sports.naver.com/schedule/games?upperCategoryId=kbaseball&date=${todayStr}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://sports.news.naver.com/kbaseball/index',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    // 성공하면 데이터 전송
    res.json(response.data);

  } catch (error) {
    if (error.response) {
      // 네이버가 보낸 에러 메시지를 브라우저에서도 볼 수 있게 전달
      console.error('Naver Error Status:', error.response.status);
      res.status(error.response.status).json({
        error: "Naver API rejected request",
        details: error.response.data
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = app;
