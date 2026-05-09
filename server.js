const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors()); // 브라우저 차단 해제
app.use(express.static('.')); // 현재 폴더의 index.html 읽기

// 네이버 API 대리 호출 경로
app.get('/api/kbo', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, ''); 
    const url = `https://api-gw.sports.naver.com/schedule/games?upperCategoryId=kbaseball&date=20260509`; // 테스트용 날짜 고정

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://sports.news.naver.com/kbaseball/index'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: '데이터를 가져오는데 실패했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
