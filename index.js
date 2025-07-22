require("dotenv").config();
const express = require("express");
const { Client, middleware } = require("@line/bot-sdk");
const axios = require("axios");
const FormData = require("form-data");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new Client(config);

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

app.post("/webhook", middleware(config), async (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then(() => res.sendStatus(200));
});

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "image") return;

  try {
    const imageBuffer = await getImageContent(event.message.id);
    const goFileUrl = await uploadToGoFile(imageBuffer);
    const visionText = await askOpenAIVision(goFileUrl);

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "くまお先生の回答だよ🐻\n\n" + visionText,
    });
  } catch (err) {
    console.error("エラー:", err);
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "画像の処理中にエラーが発生しました…🐻💦",
    });
  }
}

async function getImageContent(messageId) {
  const response = await axios.get(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    responseType: "arraybuffer",
    headers: {
      Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
    },
  });
  return Buffer.from(response.data, "binary");
}

async function uploadToGoFile(imageBuffer) {
  const form = new FormData();
  form.append("file", imageBuffer, { filename: "image.jpg" });

  const response = await axios.post("https://api.gofile.io/uploadFile", form, {
    headers: form.getHeaders(),
  });

  if (response.data.status !== "ok") throw new Error("GoFile upload failed");
  return response.data.data.downloadPage;
}

async function askOpenAIVision(imageUrl) {
  const res = await openai.createChatCompletion({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", content: "この画像の内容をやさしく解説してください（高校生向け）" },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: 1000,
  });

  return res.data.choices[0].message.content;
}

app.listen(port, () => {
  console.log("✅ Server is running on port", port);
});
