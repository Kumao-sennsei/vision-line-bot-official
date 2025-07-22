// .envファイル読み込み（Railwayでも必要）
require('dotenv').config();

// 必要なモジュール
const express = require('express');
const line = require('@line/bot-sdk');

// Expressアプリ初期化
const app = express();
const port = process.env.PORT || 8080;

// LINE設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

// 以下、ルーティングやhandler追加していく...
