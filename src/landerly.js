import axios from 'axios';
import jwt_decode from 'jwt-decode';
import dayjs from 'dayjs';

import logger from './logger.js';


export class LanderlyClient {
    constructor(email, password) {
        this.email = email;
        this.password = password;
        this.token = null;
    }

    expired() {
        // TODO clean this up
        if(this.token == null)
            return true;
        else if ((dayjs().isAfter(dayjs.unix(this.token_decoded.exp)))) 
            return true; 
        return false;
    }

    async authenticate() {
        try {
            const resp = await axios.post(`${process.env.LANDERLY_URL}/login`, {
                email: this.email,
                password: this.password
            });
            this.token = resp.data.token;
            this.token_decoded = jwt_decode(resp.data.token);
        }
        catch (err) {
            logger.error(err);
        }
    }

    async getTweetIdeas(prompt, number=1) {
        let token;
        if (this.expired())
            token = await this.authenticate();
        else
            token = this.token;

        try {
            const resp = await axios.post(`${process.env.LANDERLY_URL}/tweets/idea`, {
                prompt: prompt,
                number: number
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return resp.data.content;
        }
        catch (err) {
            logger.error(err);
        }
    }

    async getTweetThread(prompt) {
        let token;
        if (this.expired())
            token = await this.authenticate();
        else
            token = this.token;

        try {
            const resp = await axios.post(`${process.env.LANDERLY_URL}/tweets/thread`, {
                prompt: {
                    text: prompt
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return resp.data.tweets;
        }
        catch (err) {
            logger.error(err);
        }
    }

    async getTweetReply(prompt, sentiment, replyto) {
        let token;
        if (this.expired())
            token = await this.authenticate();
        else
            token = this.token;

        try {
            const resp = await axios.post(`${process.env.LANDERLY_URL}/tweets/reply`, {
                prompt: {
                    text: prompt,
                    sentiment: sentiment
                },
                replyto: replyto
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return resp.data.tweets.reply;
        }
        catch (err) {
            logger.error(err);
        }
    }
}