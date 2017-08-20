require('dotenv').config()
const express = require('express')
const twitter = require('./twitter')
const app = express()

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
})

app.get('/:lat/:long/:range/:count', function (req, res) {
    const lat = req.params.lat
    const long = req.params.long
    const range = req.params.range
    const count = req.params.count

    if (lat !== undefined &&
        long !== undefined) {
        twitter.getTweets({
            lat: lat,
            long: long,
            range: range !== undefined
                ? range
                : '1km',
            count: count !== undefined
                ? count
                : 10
        })
            .then(data => res.send(data))
    } else {
        res.send({error: 'You must pass some coordinates'})
    }
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
