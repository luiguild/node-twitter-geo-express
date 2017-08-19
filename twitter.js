const Twit = require('twit')

const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000
})

const sanFrancisco = [
    '-122.75', '36.8', '-121.75', '37.8'
]

const stream = T.stream('statuses/filter', {
    locations: sanFrancisco
})

stream.on('tweet', tweet => {
    console.log(tweet)
})

module.exports = {
    stream
}
