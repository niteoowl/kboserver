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
    
    // targetDate에서 연도와 월 추출 (예: 2026-05-12 -> 2026, 05)
    const [year, month] = targetDate.split('-');

    console.log(`[Request] Fetching KBO data for month: ${year}-${month}, target: ${targetDate}`);

    const response = await axios.get('https://api-gw.sports.naver.com/schedule/games', {
      params: {
        upperCategoryId: 'kbaseball',
        category: 'kbo', // KBO 리그로 한정
        year: year,
        month: month // 해당 월 전체 데이터를 가져옴
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://sports.news.naver.com/kbaseball/index',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    // 네이버는 응답 구조가 날짜별로 묶여있을 때가 있습니다. (result.games 또는 result.monthlySchedule)
    // 모든 게임 리스트를 하나로 합친 후 필터링합니다.
    let allGames = [];
    
    if (response.data.result.games) {
      allGames = response.data.result.games;
    } else if (response.data.result.monthlySchedule) {
      // 월간 일정 구조일 경우 데이터를 평탄화
      allGames = Object.values(response.data.result.monthlySchedule).flat();
    }

    // 요청한 날짜(targetDate)와 일치하는 경기만 필터링
    const filteredGames = allGames.filter(game => game.gameDate === targetDate);

    res.status(200).json({
      requestedDate: targetDate,
      totalCount: filteredGames.length,
      games: filteredGames
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: "Data Fetching Failed", 
      message: error.message 
    });
  }
});

module.exports = app;
