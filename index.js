// ### Libraries and globals

// This bot works by inspecting the front page of Google News. So we need
// to use `request` to make HTTP requests, `cheerio` to parse the page using
// a jQuery-like API, `underscore.deferred` for [promises](http://otaqui.com/blog/1637/introducing-javascript-promises-aka-futures-in-google-chrome-canary/),
// and `twit` as our Twitter API library.
var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore.deferred');
var Twit = require('twit');
var T = new Twit(require('./config.js'));

var baseUrl = 'http://news.google.com';

//clickbait patterns
var CBPatts = ['1 weird trick to guarantee a better ######',
'###### loses it and restores my faith in humanity',
"If you think ###### is bad, you won’t believe what happens next",
'See how ###### uses this one weird trick to get ahead',
'If you could kill ###### and get away with it, would you?',
'This story about ###### is so sweet… until the end!',
'Use this one weird trick for a bigger ######.',
"Won’t somebody think of ######?",
"19 of the cutest ###### you’ve ever seen!",
'Check out the hot new ###### that has everybody talking!',
'Watch this video to discover the true meaning of ######',
'###### HATE this new trick',
"The one trick ###### doesn’t want you to know about",
'See how ###### made extra money in the bedroom',
'10 things you should never feed to ######',
"Here’s what happened when ###### visited a petting zoo",
'I left ###### home alone and THIS happened!',
'###### says lasting relationship comes down to these easy steps',
'###### ignored this one thing: Big mistake!',
"Do you hate ######? You probably aren’t alone.",
'Customers were not prepared for what ###### refused to do',
'See how ###### lost 10 lbs in just 10 days!',
'You might think you know ###### but just watch',
'A truth about ###### that will take you by surprise',
"Why can’t ###### get a date? You won’t believe the reason",
'In just 2 minutes, see the most amazing video of ###### of your life',
'The next time someone complains about ###### just send them this',
'Young and innocent, ###### finally reveals the truth',
"Six ###### quotes you’ve never heard (and won’t believe)",
"Here's something you probably don’t know about ###### (and probably won’t believe)"];


// ### Utility Functions

// This function lets us call `pick()` on any array to get a random element from it.
Array.prototype.pick = function() {
  return this[Math.floor(Math.random()*this.length)];
};

// This function lets us call `pickRemove()` on any array to get a random element
// from it, then remove that element so we can't get it again.
Array.prototype.pickRemove = function() {
  var index = Math.floor(Math.random()*this.length);
  return this.splice(index,1)[0];
};

// ### Screen Scraping

// We pass this function a category code (see `tweet` below). We grab the Google News
// topics page for that category and load the html into `cheerio`. We parse the page for
// text from the links in the left-hand bar, which becomes a list of topics.
// For example, if we passed it 'e' for Entertainment, we might get: Miley Cyrus, Oscars,
// Kanye West, and so on.
function getTopics(category) {
  var topics = [];
  var dfd = new _.Deferred();
  request(baseUrl + '/news/section?ned=us&topic=' + category, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var $ = cheerio.load(body);
      $('.topic').each(function() {
        var topic = {};
        topic.name = this.text();
        topic.url = baseUrl + this.children().first().attr('href');
        topics.push(topic);
      });
      dfd.resolve(topics);
    }
    else {
      dfd.reject();
    }
  });
  // The function returns a promise, and the promise resolves to the array of topics.
  return dfd.promise();
}

// We pass this function a URL for a specific topic (for example:
// [Miley Cyrus](https://news.google.com/news/section?pz=1&cf=all&ned=us&hl=en&q=Miley%20Cyrus).
// We then get the page, feed the HTML to `cheerio`, and then pick a random headline
// from the page.
function getHeadline(url) {
  var dfd = new _.Deferred();
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var $ = cheerio.load(body);
      var headlines = $('.titletext');
      // `pick()` doesn't work here because `headlines` isn't an array, so instead we use `cheerio`'s `eq` which
      // give us a matched element at a given index, and pass it a random number.
      var headline = headlines.eq(Math.floor(Math.random()*headlines.length)).text();
      dfd.resolve(headline);
    }
    else {
      dfd.reject();
    }
  });
  return dfd.promise();
}

// ### Tweeting

//      Category codes:
//      w:  world
//      n:  region
//      b:  business
//      tc: technology
//      e:  entertainment
//      s:  sports

// This is the core function that is called on a timer that initiates the @twoheadlines algorithm.
// First, we get our list of topics from the Google News sidebar. 
// Then we pick-and-remove a random topic from that list.
// Next we grab a random headline available for that topic.
// If the topic itself is in the headline itself, we replace it with a new topic. (For example,
// if `topic.name` is "Miley Cyrus" and `headline` is "Miley Cyrus Wins a Grammy", then we
// get a topic from a different category of news and fill in the blank for "______ Wins a Grammy".)
// If we're unable to find a headline where we can easily find/replace, we simply try again.
function tweet() {
  var categoryCodes = ['w', 'n', 'b', 'tc', 'e', 's'];
  getTopics(categoryCodes.pickRemove()).then(function(topics) {
    var topic = topics.pickRemove();
    console.log(topic);
	  var pattern = CBPatts.pick();
          var headline = pattern.replace('######', topic.name);
          console.log(headline);
          T.post('statuses/update', { status: headline }, function(err, reply) {
            if (err) {
              console.log('error:', err);
            }
            else {
              console.log('reply:', reply);
            }
          });
        });
      }

// Tweets once on initialization.
tweet();

// Tweets every 60 minutes.
setInterval(function () {
  try {
    tweet();
  }
  catch (e) {
    console.log(e);
  }
}, 1000 * 60 * 2); //do it once per hour
