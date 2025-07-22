// ===== 必要モジュール読み込み =====
const express = require('express');
const line = require('@line/bot-sdk');
const dotenv = require('dotenv');
dotenv.config();

// ===== LINE Bot設定 =====
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

// ===== Expressサーバー起動準備 =====
const app = express();
const port = process.env.PORT || 8080;

// ✅ ここが重要（JSON解析ミドルウェア）
app.use(express.json());

// ===== Webhookエンドポイント設定 =====
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const results = await Promise.all(req.body.events.map(handleEvent));
    res.json(results);
  } catch (error) {
    console.error('イベント処理エラー:', error);
    res.status(500).end();
  }
});

// ===== イベント処理関数 =====
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text;
  const replyText = `くまお先生だよ🐻：『${userMessage}』って言ったね！えらいぞ〜✨`;

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText,
  });
}

// ===== サーバー起動 =====
app.listen(port, () => {
  console.log(`✨ サーバー起動成功！ポート番号: ${port}`);
});
