require('dotenv').config()
const express = require('express')
const twitter = require('./twitter')
const app = express()

app.get('/', function (req, res) {
    res.send(twitter.stream)
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
