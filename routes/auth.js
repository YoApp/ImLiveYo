var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config');
var twitch = require('../twitch');

var sqlite3 = require('sqlite3');

/* GET users listing. */
router.get('/login', function(req, res, next) {

  var sess = req.session;

  if (sess.twitchName) {
    res.send("you're already logged in!");
    return;
  }


  var code = req.query.code;

  twitch.authNewUser(code,
    function(response){
      if (typeof response === 'object') {
        var accessToken = response.access_token;

        twitch.getUserByToken(accessToken,
          function(userData) {

            if (typeof userData === 'object'
              && typeof userData.name === 'string'
              && twitch.validateUsername(userData.name)) {

              var username = userData.name;
              var accessToken = response.access_token;
              var timestamp = Date.now();

              var db = new sqlite3.Database('main.db');

              // this update/insert method from http://stackoverflow.com/a/15277374/992504

              var updateStmt = db.prepare("UPDATE users SET twitchName=?, twitchAccessToken=?, isActive=?, lastModified=? WHERE twitchName=?");
              updateStmt.run(username, accessToken, 1, timestamp, username);
              updateStmt.finalize();

              var insertStmt = db.prepare("INSERT OR IGNORE INTO users (twitchName, twitchAccessToken, isActive, lastModified) VALUES (?, ?, ?, ?)");
              insertStmt.run(username, accessToken, 1, timestamp);
              insertStmt.finalize();

              sess.twitchName = username;
              sess.twitchAccessToken = accessToken;

              res.send("it worked! welcome " + username);

            } else {
              res.send("something broke :/");
            }
          }
        );

      } else {
        res.send("something broke :/");
      }
    }
  );
});

router.get('/logout', function(req, res, next) {

  var sess = req.session;
  delete sess.twitchName;
  delete sess.twitchAccessToken;
  res.send("logged out!");

});

module.exports = router;
