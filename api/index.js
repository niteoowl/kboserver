const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/kbo', async (req, res) => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD 안전하게 생성

    const url = `https://api-gw.sports.naver.com/schedule/games?upperCategoryId=kbaseball&date=${todayStr}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    res.status(200).json(response.data);
  } catch (error) {
    // 서버 로그에서 원인을 볼 수 있게 출력
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
