require('dotenv').config()
const express = require('express')
const twitter = require('./twitter')
const app = express()

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
                : 100
        })
            .then(data => res.send(data))
    } else {
        res.send({error: 'You must pass some coordinates'})
    }
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
