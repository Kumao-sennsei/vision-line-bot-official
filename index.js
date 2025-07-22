// ===== 必要モジュール読み込み =====
const express = require('express');
const line = require('@line/bot-sdk');
const dotenv = require('dotenv');

// ===== 環境変数読み込み =====
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
  // テキストメッセージ以外は無視
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text;

  // 応答メッセージ（ここはくまお先生風に固定返答）
  const replyText = `くまお先生だよ🐻：『${userMessage}』って言ったね！えらいぞ～✨`;

  // LINEへ返信
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText,
  });
}

// ===== サーバー起動 =====
app.listen(port, () => {
  console.log(`✨ サーバー起動成功！ポート番号: ${port}`);
});
