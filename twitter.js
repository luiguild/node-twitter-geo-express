const Twit = require('twit')

const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000
})

const getTweets = ({lat, long, range, count}) => {
    return new Promise((resolve, reject) => {
        return T.get('search/tweets', {
            q: `geocode:${lat},${long},${range}`,
            count: count
        }, (err, data, response) => {
            if (err) {
                reject(err)
            }

            const tweet = data.statuses.map((elm, indx, arr) => {
                return {
                    created_at: elm.created_at,
                    text: elm.text,
                    name: elm.user.name,
                    screen_name: elm.user.screen_name
                }
            })

            resolve(tweet)
        })
    })
}

module.exports = {
    getTweets
}
