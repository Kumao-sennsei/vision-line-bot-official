// 必須モジュール読み込み
const express = require('express');
const line = require('@line/bot-sdk');
const dotenv = require('dotenv');
dotenv.config();

// LINE Bot設定（.envで管理）
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// OpenAI設定（GPT-4 APIキー）
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Expressアプリ初期化
const app = express();
const port = process.env.PORT || 8080;

// LINE Webhookの署名検証＋本文取得
app.post('/webhook', line.middleware(config), async (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) => res.json(result));
});

// イベント処理関数
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userMessage = event.message.text;

  // OpenAIへ問い合わせ（GPT-4）
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'あなたは優しいくまお先生です。生徒に分かりやすく会話形式で答えてください。' },
      { role: 'user', content: userMessage },
    ],
  });

  const aiReply = completion.choices[0].message.content;

  // ユーザーへ返信
  const client = new line.Client(config);
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: aiReply,
  });
}

// サーバー起動
app.listen(port, () => {
  console.log(`サーバー起動中✨ ポート: ${port}`);
});
