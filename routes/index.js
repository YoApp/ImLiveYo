var express = require('express');
var router = express.Router();

var twitch = require('../twitch');

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index',{
    twitchLoginUrl: twitch.getLoginUrl()
  });
});

module.exports = router;
