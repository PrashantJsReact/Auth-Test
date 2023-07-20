require('dotenv').config();
const express = require('express');
const app = express();


app.get('/', (req, res, next) => {
    res.send("<h1>Hello Prashant I am fine and enjoying!</h1>")
})

module.exports = app;