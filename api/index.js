const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

function getKSTDateString() {
  const now = new Date();
  return now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
}

app.get('/api/kbo', async (req, res) => {
  try {
    const targetDate = req.query.date || getKSTDateString();

    const response = await axios.get('https://api-gw.sports.naver.com/schedule/games', {
      params: {
        upperCategoryId: 'kbaseball',
        date: targetDate
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://sports.news.naver.com/kbaseball/index',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    // 핵심 수정 부분: 
    // 네이버는 해당 주(week)의 데이터를 다 주므로, 요청한 날짜와 일치하는 게임만 필터링합니다.
    const allGames = response.data.result.games || [];
    const filteredGames = allGames.filter(game => game.gameDate === targetDate);

    res.status(200).json({
      requestedDate: targetDate,
      totalCount: filteredGames.length,
      games: filteredGames
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
