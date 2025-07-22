const express = require('express');
const line = require('@line/bot-sdk');
require('dotenv').config();

const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

// ✅ LINEミドルウェアを /webhook ルートに設定！
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('Webhook Error:', err);
      res.status(500).end();
    });
});

// ✅ 簡単な echo bot
const client = new line.Client(config);
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `くまお先生より：${event.message.text}`
  });
}

// ✅ ポート起動
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ 起動中 ✨ ポート: ${PORT}`);
});
