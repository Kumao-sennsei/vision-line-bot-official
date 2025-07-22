// ✅ vision-line-bot-official 用：完全Webhook対応 index.js（成功確定版）

require('dotenv').config();
const express = require('express');
const { middleware, Client } = require('@line/bot-sdk');
const rawBodySaver = require('raw-body');
const app = express();

// ✅ 環境変数からLINE構成読み込み
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new Client(config);

// ✅ LINEからのリクエスト検証用：body-parser + raw-body
app.use('/webhook', express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// ✅ Webhookエンドポイント：POSTでLINEと連携
app.post('/webhook', middleware(config), async (req, res) => {
  try {
    const events = req.body.events;
    if (events.length === 0) return res.status(200).end();

    // ✅ メッセージイベントにだけ反応
    const results = await Promise.all(events.map(async (event) => {
      if (event.type === 'message' && event.message.type === 'text') {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: `くまお先生だよ～🐻：${event.message.text}`
        });
      }
    }));

    return res.status(200).json(results);
  } catch (err) {
    console.error('エラー発生:', err);
    return res.status(500).end();
  }
});

// ✅ ポート8080でリスン（Railway用）
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✨ サーバー起動成功！ポート番号: ${PORT}`);
});
