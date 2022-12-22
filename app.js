import "dotenv/config.js";
import { TwitterClient } from './src/twitter.js';
import { LanderlyClient } from './src/landerly.js';
import logger from "./src/logger.js";


const twitter = new TwitterClient(process.env.TWITTER_CONSUMER_KEY, process.env.TWITTER_CONSUMER_SECRET, process.env.TWITTER_OAUTH_TOKEN, process.env.TWITTER_OAUTH_TOKEN_SECRET);
const landerly = new LanderlyClient(process.env.LANDERLY_EMAIL, process.env.LANDERLY_PASSWORD);

// Set parameters here
const MIN_WAIT_MINUTES = 10;
const MAX_WAIT_MINUTES = 25;
const THEMES = [
    "Entrepreneurship, the future of work, and content creation",
    "Being a successful content creator",
    "Building a high-converting landing page",
    "How to get ideas for content",
    "Personal growth"
];

const SENTIMENTS = [
    'entreprenurial',
    'positive',
    'upbeat',
    'encouraging',
    'agreeing',
    'disagreeing'
];

let replied_to = [];

const findTweetFromTimeline = async (timeline) => {
    return timeline[Math.floor(Math.random() * timeline.length)];
}

const alreadyReplied = async (tweet) => {
    const timeline = await twitter.getMyTweets();
    let replied_to = [];

    // Strip out the in_reply_to_user_id from each tweet
    for (let i = 0; i < timeline.length; i++) {
        if(timeline[i].hasOwnProperty('referenced_tweets')) {
            for (let j = 0; j < timeline[i].referenced_tweets.length; j++)
            {
                if (timeline[i].referenced_tweets[j].type == 'replied_to')
                {
                    replied_to.push(timeline[i].referenced_tweets[j].id);
                }
            }
        }
    }
    return replied_to.includes(tweet);
}


const main = async () => {
    const auth = await landerly.authenticate();
    while (true) {
        try {
            // Wait between MIN_WAIT and MAX_WAIT minutes
            let wait = Math.floor(Math.random() * (MAX_WAIT_MINUTES - MIN_WAIT_MINUTES) + MIN_WAIT_MINUTES) * 60000;
            logger.info(`Waiting ${wait/60000} minutes`);
            await new Promise(resolve => setTimeout(resolve, wait));
        
            // Craft a new thread
            const ideas = await landerly.getTweetIdeas(THEMES[Math.floor(Math.random() * THEMES.length)]);  // Choose random theme from themes
            const thread = await landerly.getTweetThread(ideas[0].idea);

            let threads = await twitter.createThread(thread);

            // Search for threads to reply to
            const num_tweets_to_search = 35;
            let timeline = (await twitter.getTimeline(num_tweets_to_search)).data.data;
            let author = process.env.TWITTER_USER_ID;
            let tweet = await findTweetFromTimeline(timeline);
            
            // Ensure we aren't about to reply to our own tweet, or one we've replied to
            while(author === process.env.TWITTER_USER_ID || await alreadyReplied(tweet.id)) {
                tweet = await findTweetFromTimeline(timeline);
                author = await twitter.getTweetAuthor(tweet.id);
            }           
            
            const reply = await landerly.getTweetReply(tweet.text, SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)], tweet.id);
            const resp = await twitter.tweet(reply, {
                in_reply_to_tweet_id: tweet.id
            });

        }
        catch (err) {
            logger.error(err);
            continue;
        }
    }
    
};

main();

