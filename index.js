// index.js
require('dotenv').config(); // これ1つでOK！重複禁止

const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
const port = process.env.PORT || 8080;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('エラー発生:', err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `くまお先生からの返信：${event.message.text}`
  });
}

app.listen(port, () => {
  console.log(`サーバー起動中✨ ポート: ${port}`);
});
