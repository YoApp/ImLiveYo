var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var twitch = require('../twitch');


router.get('/', function(req, res, next) {

  var sess = req.session;

  if (!sess.twitchName) {
    res.send("You must be logged in!");
    return;
  }

  var db = new sqlite3.Database('main.db');

  var getStmt = db.prepare("SELECT * FROM users WHERE twitchName=?");
  getStmt.get(sess.twitchName, function(err, row) {

    twitch.getFollowedStreams(sess.twitchAccessToken, function(streamData) {

      res.render('settings', {
        twitchName: sess.twitchName,
        yoName: (typeof row.yoName === 'string') ? row.yoName : "",
        isActive: row.isActive === 1 ? true : false,
        whosLive: (typeof streamData.streams !== 'object') ? [] : streamData.streams
      });
    })
  });
  getStmt.finalize();
});

router.post('/', function(req, res, next) {

  var sess = req.session;

  if (!sess.twitchName) {
    res.send("You must be logged in!");
    return;
  }

  var yoName = req.body.yoName.toUpperCase();
  var isActive = req.body.isActive == "1" ? 1 : 0;

  //TODO validate yoName and isActive

  var timestamp = Date.now();

  var db = new sqlite3.Database('main.db');

  var updateStmt = db.prepare("UPDATE users SET yoName=?, isActive=?, lastModified=? WHERE twitchName=?");
  updateStmt.run(yoName, isActive, timestamp, sess.twitchName);
  updateStmt.finalize();
  res.send("ok");
});

module.exports = router;
