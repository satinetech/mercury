import axios from 'axios';
import { OAuth as _OAuth } from 'oauth';

import logger from './logger.js';

export class TwitterClient {
    constructor(consumer_key, consumer_secret, oauth_token, oauth_secret) {
        this.consumer_key = consumer_key;
        this.consumer_secret = consumer_secret;
        this.oauth_token = oauth_token;
        this.oauth_secret = oauth_secret;

        this.oauth = new _OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            '1.0A',
            null,
            'HMAC-SHA1',
        );

        
    }

    getAuthHeader(url, method) {
        return this.oauth.authHeader(
          String(url),
          process.env.TWITTER_OAUTH_TOKEN,
          process.env.TWITTER_OAUTH_TOKEN_SECRET,
          method,
        )
      }

    async tweet(text, reply) {
        const url = 'https://api.twitter.com/2/tweets';
        let body = {
            text: text
        };
        if (reply != undefined) {
            body.reply = reply;
        }

        const opts = {
            url: url,
            method: 'POST',
            body: body
        };

        try {
            const response = await axios.post(
                opts.url,
                opts.body,
                { 
                    headers: {
                        Authorization: this.getAuthHeader(url, opts.method),
                        'User-Agent': 'Landerly',
                        'Content-Type': 'application/json'
                    }
                }
            );
            logger.info(`Sending tweet ${text}`);
            return response;
        }
        catch (err) {
            logger.error(err);
        }
    }

    async createThread(thread) {
        try {
            const resp1 = await this.tweet(thread[0].text);
            let lastTweetId = resp1.data.data.id;
            for (let i = 1; i < thread.length; i++) {
                let resp = await this.tweet(thread[i].text, {
                        in_reply_to_tweet_id: lastTweetId
                });
                lastTweetId = resp.data.data.id;
            }
        }
        catch (err) {
            logger.error(err);
        }
    }

    async getTimeline(max_results=10) {
        const url = `https://api.twitter.com/2/users/${process.env.TWITTER_USER_ID}/timelines/reverse_chronological?max_results=${max_results}`;

        const opts = {
            url: url
        };

        try {
            const response = await axios.get(
                opts.url,
                { 
                    headers: {
                        Authorization: this.getAuthHeader(url, 'get'),
                        'User-Agent': 'Landerly',
                        'Content-Type': 'application/json'
                    }
                }
            );

            logger.info(`Getting reverse chronological timeline for ${process.env.TWITTER_USER_ID}`);
            return response;
        }
        catch (err) {
            logger.error(err);
        }
    }

    async getTweetAuthor(id) {
        const url = `https://api.twitter.com/2/tweets/${id}?expansions=author_id`;

        const opts = {
            url: url
        };

        try {
            const response = await axios.get(
                opts.url,
                { 
                    headers: {
                        Authorization: this.getAuthHeader(url, 'get'),
                        'User-Agent': 'Landerly',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.data.author_id;
        }
        catch (err) {
            logger.error(err);
        }
    }

    async getMyTweets() {
        const url = `https://api.twitter.com/2/users/${process.env.TWITTER_USER_ID}/tweets?tweet.fields=referenced_tweets`;

        const opts = {
            url: url
        };

        try {
            const response = await axios.get(
                opts.url,
                { 
                    headers: {
                        Authorization: this.getAuthHeader(url, 'get'),
                        'User-Agent': 'Landerly',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data.data;
        }
        catch (err) {
            logger.error(err);
        }
    }
}