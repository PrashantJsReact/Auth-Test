require('dotenv').config();
const express = require('express');
const app = express();
const connect = require('./config/db.config');

connect();

app.get('/', (req, res, next) => {
  res.send('<h1>Hello Prashant I am fine and enjoying!</h1>');
});

module.exports = app;
