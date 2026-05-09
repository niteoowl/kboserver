const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// 모든 도메인에서 접속 가능하도록 허용 (CORS 에러 방지)
app.use(cors());

app.get('/api/kbo', async (req, res) => {
  try {
    // 오늘 날짜 구하기 (YYYYMMDD 형식)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}${month}${day}`;

    // 네이버 스포츠 API 주소 (오늘 날짜 데이터 요청)
    const url = `https://api-gw.sports.naver.com/schedule/games?upperCategoryId=kbaseball&date=${todayStr}`;

    const response = await axios.get(url, {
      headers: {
        // 실제 크롬 브라우저인 것처럼 속여서 차단을 방지합니다.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://sports.news.naver.com/kbaseball/index',
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: 5000 // 5초 안에 응답 없으면 중단
    });

    // 네이버에서 받은 데이터를 그대로 브라우저에 전달
    res.status(200).json(response.data);

  } catch (error) {
    console.error('Error fetching KBO data:', error.message);
    
    res.status(500).json({ 
      error: '데이터를 가져오는데 실패했습니다.',
      message: error.message 
    });
  }
});

// Vercel의 Serverless 환경을 위한 export
module.exports = app;
