var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var CONFIG = require('config');

(function () {
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });
    if (CONFIG.passport.TWITTER_CONSUMER_KEY != '') {
        passport.use(new TwitterStrategy({
            consumerKey: CONFIG.passport.TWITTER_CONSUMER_KEY,
            consumerSecret: CONFIG.passport.TWITTER_CONSUMER_SECRET,
            callbackURL: "/auth/twitter/callback"
        }, function (token, tokenSecret, profile, done) {
            console.log(profile);
            passport.session.accessToken = token;
            passport.session.profile = profile;
            process.nextTick(function () {
                return done(null, profile);
            });
        }));
    }
})();

exports.passport = passport;

