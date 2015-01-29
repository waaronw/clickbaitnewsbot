# @ClickBaitNewsb

A Twitter bot that makes clickbait out of current Google news topics
This bot is based on the work of @dariusk (Twitter: @tinysubversions) and specifically his bot @twoheadlines

The following are basic instructions for this stripped-down version of his bot

##Instructions

Requires [node](http://nodejs.org/) and [npm](http://npmjs.org/) (installing node installs npm too). You also need a Twitter App access token, consumer key, and associated secrets. [You can get those here](https://dev.twitter.com/apps/new). You'll probably also want a fresh twitter account for your bot, though you could have it post to one you already own, too!

Clone the repo, then in your project directory, install the dependencies:

`$ npm install`

Next, edit `config.js` to include your Twitter App access token, consumer key, and associated secrets. This is important! Without this you'll be unable to tweet.

To actually run the bot, do:

`$ node index.js`

This will give you some output, including, after a bit, a bunch of text that is the tweet that's just been tweeted. You can check the twitter account to see if it's updated to verify that it actually works.

## License
Copyright (c) 2015 W. Aaron Waychoff
Copyright (c) 2013 Darius Kazemi  
Licensed under the MIT license.
