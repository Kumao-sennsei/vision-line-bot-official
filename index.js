// index.js

require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// LINE BOTの設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// ミドルウェア
app.use(bodyParser.json());
app.post("/webhook", line.middleware(config), async (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error("エラーハンドリング:", err);
      res.status(500).end();
    });
});

// メッセージ処理
const client = new line.Client(config);

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text;
  const replyText = `くまお先生です♪ メッセージありがとう！「${userMessage}」って言ってたね(●´ω｀●)`;

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: replyText,
  });
}

// 起動
app.listen(port, () => {
  console.log(`✨ サーバー起動成功！ポート番号: ${port}`);
});
