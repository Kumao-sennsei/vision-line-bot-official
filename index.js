require("dotenv").config();
const express = require("express");
const { Client, middleware } = require("@line/bot-sdk");
const app = express();
const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new Client(config);

app.post("/webhook", middleware(config), async (req, res) => {
  try {
    const events = req.body.events;
    const results = await Promise.all(events.map(handleEvent));
    res.json(results);
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).end();
  }
});

function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: `くまお先生です♪「${event.message.text}」って言ってたね(●´ω｀●)`,
  });
}

app.listen(port, () => {
  console.log(`✨ サーバー起動成功！ポート番号: ${port}`);
});
