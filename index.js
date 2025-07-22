require('dotenv').config();
const express = require('express');
const { middleware, Client } = require('@line/bot-sdk');
const axios = require('axios');
const rawBodySaver = require('raw-body');
const fs = require('fs');
const path = require('path');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new Client(config);
const app = express();

// 生のリクエストを保持（画像処理など用）
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('application/json')) {
    rawBodySaver(req, {
      length: req.headers['content-length'],
      limit: '10mb',
      encoding: 'utf-8',
    }, (err, string) => {
      if (err) return next(err);
      req.rawBody = string;
      next();
    });
  } else {
    next();
  }
});

app.use(middleware(config));

app.post('/webhook', (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('エラー:', err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message') return;

  const message = event.message;

  if (message.type === 'text') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `くまお先生です🐻「${message.text}」ですね！`,
    });
  }

  if (message.type === 'image') {
    try {
      const stream = await client.getMessageContent(message.id);
      const buffer = await streamToBuffer(stream);

      const uploadRes = await uploadToGoFile(buffer);
      const fileUrl = uploadRes.data.downloadPage;

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `画像を受け取りました！くまお先生がチェックします🐻\n\n📸 ${fileUrl}`,
      });
    } catch (err) {
      console.error('画像処理エラー:', err);
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '画像の処理中にエラーが発生しました…💦',
      });
    }
  }
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function uploadToGoFile(buffer) {
  const formData = new FormData();
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  formData.append('file', blob, 'upload.jpg');

  const res = await axios.post('https://api.gofile.io/uploadFile', formData, {
    headers: formData.getHeaders?.() || formData.headers || {},
  });

  return res.data;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`起動中🎉 ポート: ${PORT}`);
});
