const express = require('express');
const line = require('@line/bot-sdk');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();

// 正しい変数名を使う！
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = process.env.PORT || 8080;

// Webhookルート設定
app.post('/webhook', line.middleware(config), async (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) => res.json(result));
});

// イベント処理
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userMessage = event.message.text;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'あなたは優しくて親切なくまお先生です。生徒の質問に、会話形式で楽しく丁寧に答えてください。',
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  const replyMessage = response.choices[0].message.content;

  const client = new line.Client(config);
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyMessage,
  });
}

// 起動ログ
app.listen(port, () => {
  console.log(`🐻 くまお先生が起動しました！ポート: ${port}`);
});
