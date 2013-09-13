var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var CONFIG = require('config');

(function () {
    console.log("consumer_key");
    console.log(CONFIG.passport.TWITTER_CONSUMER_KEY);
    if (CONFIG.passport.TWITTER_CONSUMER_KEY != '') {
        passport.use(new TwitterStrategy({
            consumerKey: CONFIG.passport.TWITTER_CONSUMER_KEY,
            consumerSecret: CONFIG.passport.TWITTER_CONSUMER_SECRET,
            callbackURL: "/auth/twitter/callback"
        }, function (token, tokenSecret, profile, done) {
            passport.session.accessToken = token;
            passport.session.profile = profile;
            process.nextTick(function () {
                return done(null, profile);
            });
        }));
    }
})();

exports.passport = passport;

