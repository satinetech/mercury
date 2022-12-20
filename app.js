require('dotenv').config();
const TwitterClient = require('./src/twitter');


twitter = new TwitterClient(process.env.TWITTER_CONSUMER_KEY, process.env.TWITTER_CONSUMER_SECRET, process.env.TWITTER_OAUTH_TOKEN, process.env.TWITTER_OAUTH_TOKEN_SECRET);