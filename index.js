// 必要なモジュール
const express = require('express');
const line = require('@line/bot-sdk');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// LINE設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);

// Webhookエンドポイントを設定
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    await Promise.all(req.body.events.map(handleEvent));
    res.status(200).end();
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).end();
  }
});

// イベント処理関数
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userMessage = event.message.text;
  const replyMessage = `くまお先生だよ！「${userMessage}」って言ったね！`;

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyMessage
  });
}

// サーバー起動
app.listen(port, () => {
  console.log(`✅ 起動中 ✨ ポート: ${port}`);
});
