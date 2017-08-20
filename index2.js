require('dotenv').config()
const app = require('express')()
// const twitter = require('./twitter')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const fetch = require('node-fetch')
const Twit = require('twit')
let sendBlock = false
const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000
})

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
})

io.on('connection', socket => {
    socket.on('issLocation', data => {
        console.log('\nNew ISS location!', data)
        clearTimeout(sendBlock)
        let tweetBlock = []
        let nominatim
        let area

        nominatim = `http://nominatim.openstreetmap.org/search?q=${data.lat},${data.long}&format=json&limit=1&addressdetails=1&email=iss@s1x.com.br`
        console.log('Requesting location from Nominatim:', nominatim)
        fetch(nominatim)
            .then(response => response.json())
            .then(data => {
                area = data[0] !== undefined
                    ? data[0].boundingbox
                    : undefined

                if (area !== undefined && data[0].address !== undefined) {
                    nominatim = `http://nominatim.openstreetmap.org/search?q=${data[0].address.state}&format=json&limit=1&addressdetails=1&email=iss@s1x.com.br`
                    console.log('Requesting Country bounding box from Nominatim:', nominatim)
                    fetch(nominatim)
                        .then(response => response.json())
                        .then(data => {
                            area = data[0] !== undefined
                                ? data[0].boundingbox
                                : undefined

                            let stream = T.stream('statuses/filter', {
                                locations: ([area]).toString()
                            })

                            console.log(`\n${area}`)
                            console.log(`Bounding box found! Waiting Tweets...`)
                            stream.on('tweet', function (tweet) {
                                let newTweet

                                console.log('\nReceiving tweet...')
                                if (tweet.geo === null && tweet.coordinates === null) {
                                    console.log('Tweet without coordinates.')
                                }

                                if (tweet.geo || tweet.coordinates) {
                                    newTweet = {
                                        created_at: tweet.created_at,
                                        text: tweet.text,
                                        name: tweet.user.name,
                                        screen_name: tweet.user.screen_name,
                                        coordinates: {
                                            latitude: tweet.geo !== null
                                                ? tweet.geo.coordinates[0]
                                                : tweet.coordinates !== null
                                                    ? tweet.coordinates.latitude
                                                    : tweet.place !== null
                                                        ? tweet.place.bounding_box.coordinates[0][0][0]
                                                        : null,
                                            longitude: tweet.geo !== null
                                                ? tweet.geo.coordinates[1]
                                                : tweet.coordinates !== null
                                                    ? tweet.coordinates.longitude
                                                    : tweet.place !== null
                                                        ? tweet.place.bounding_box.coordinates[0][0][1]
                                                        : null
                                        }
                                        // raw: tweet
                                    }

                                    if (tweetBlock.length <= 50) {
                                        console.log('Pushing new tweet...')
                                        tweetBlock.push(newTweet)
                                    }

                                    console.log('Creating buffer to emit the tweets...')
                                    sendBlock = setTimeout(() => {
                                        console.log(`\nEmiting block with ${tweetBlock.length} tweets\n`, tweetBlock, '\n')
                                        socket.emit('streamTweet', tweetBlock)
                                    }, 8000)
                                }
                            })
                        })
                } else {
                    console.log("This location don't have a valid bounding box to request new Tweets...")
                }
            })
    })
})

server.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
