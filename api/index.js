const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/kbo', async (req, res) => {
  try {
    // 1. 한국 시간 기준으로 YYYYMMDD 생성 (서버 시간 오류 방지)
    const kstDate = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
    const year = kstDate.getUTCFullYear();
    const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getUTCDate()).padStart(2, '0');
    const todayStr = `${year}${month}${day}`;

    console.log('--- Debugging KBO API ---');
    console.log('Requested Date:', todayStr);

    // 2. 네이버 API 주소 (파라미터 순서와 형식을 네이버 실제 요청과 동일하게 맞춤)
    const url = `https://api-gw.sports.naver.com/schedule/games`;
    
    const response = await axios.get(url, {
      params: {
        upperCategoryId: 'kbaseball',
        date: todayStr
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://sports.news.naver.com/kbaseball/index',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    // 3. 성공 시 데이터 반환
    res.status(200).json(response.data);

  } catch (error) {
    // 4. 에러 발생 시 로그에 상세 원인 출력
    if (error.response) {
      console.error('Naver API Rejected:', error.response.status, error.response.data);
      res.status(error.response.status).json({
        msg: "네이버에서 거절당함",
        naverError: error.response.data
      });
    } else {
      console.error('Server Error:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = app;
