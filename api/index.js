const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/kbo', async (req, res) => {
  try {
    // 1. 한국 시간 기준으로 날짜 생성 (밤 늦은 시간 오류 방지)
    const kstDate = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
    const todayStr = kstDate.toISOString().slice(0, 10).replace(/-/g, ''); 
    
    console.log('Final Request Date:', todayStr);

    // 2. 네이버 API 주소 조립 (가장 원시적이고 확실한 방법)
    const url = `https://api-gw.sports.naver.com/schedule/games?upperCategoryId=kbaseball&date=${todayStr}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://sports.news.naver.com/kbaseball/index',
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: 5000
    });

    res.status(200).json(response.data);

  } catch (error) {
    if (error.response) {
      // 네이버가 뱉은 에러를 그대로 노출해서 원인 파악
      res.status(400).json({
        msg: "네이버 거절 사유 확인",
        dateUsed: error.config.url.split('date=')[1], // 어떤 날짜로 찔러봤는지 확인
        naverRaw: error.response.data
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = app;
