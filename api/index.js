const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

/**
 * 한국 시간(KST) 기준으로 YYYY-MM-DD 문자열을 반환하는 함수
 */
function getKSTDateString() {
  const now = new Date();
  // 'sv-SE' 로케일은 YYYY-MM-DD 형식을 반환하므로 활용하기 좋습니다.
  return now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
}

app.get('/api/kbo', async (req, res) => {
  try {
    // 1. 우선순위: 쿼리 파라미터(?date=) -> 없으면 오늘 KST 날짜
    const targetDate = req.query.date || getKSTDateString();

    console.log(`[Request] Fetching KBO data for date: ${targetDate}`);

    // 2. 네이버 API 호출
    const response = await axios.get('https://api-gw.sports.naver.com/schedule/games', {
      params: {
        upperCategoryId: 'kbaseball',
        date: targetDate
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://sports.news.naver.com/kbaseball/index',
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: 5000 // 5초 타임아웃
    });

    // 3. 성공 응답 전송
    // 네이버 API 응답 구조를 그대로 전달하거나 필요한 부분만 가공할 수 있습니다.
    res.status(200).json({
      requestedDate: targetDate,
      data: response.data
    });

  } catch (error) {
    console.error('Error fetching KBO data:', error.message);

    if (error.response) {
      // 네이버 API 측 에러 응답
      return res.status(error.response.status).json({
        error: "Naver API External Error",
        status: error.response.status,
        data: error.response.data
      });
    }

    // 서버 내부 혹은 네트워크 에러
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
});

// Vercel 환경을 위한 export
module.exports = app;

// 로컬 테스트용 (선택 사항)
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
