const axios = require('axios');
const OAuth = require('oauth');

const logger = require('./logger');

class TwitterClient {
    constructor(consumer_key, consumer_secret, oauth_token, oauth_secret) {
        this.consumer_key = consumer_key;
        this.consumer_secret = consumer_secret;
        this.oauth_token = oauth_token;
        this.oauth_secret = oauth_secret;

        this.oauth = new OAuth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            process.env.TWITTER_API_KEY,
            process.env.TWITTER_API_SECRET,
            '1.0A',
            null,
            'HMAC-SHA1',
        );

        
    }

    getAuthHeader(url) {
        return this.oauth.authHeader(
          String(url),
          process.env.TWITTER_OAUTH_TOKEN,
          process.env.TWITTER_OAUTH_TOKEN_SECRET,
          'post',
        )
      }

    async tweet(text) {
        const url = 'https://api.twitter.com/2/tweets';
        const opts = {
            url: url,
            method: 'POST',
            body: JSON.stringify({
                text: text
            }),
        };

        const auth_header = this.getAuthHeader(opts);

        try {
            const response = await axios.post(
                opts.url,
                opts.body,
                { 
                    headers: {
                        Authorization: this.getAuthHeader(url),
                        'User-Agent': 'Landerly',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if(response.ok)
                return true;
            else {
                logger.error(response);
                return false;
            }
        }
        catch (err) {
            logger.error(err);
            return false;
        }
    }
}

module.exports = TwitterClient;