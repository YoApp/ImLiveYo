var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var session = require('express-session');

var config = require('./config');
var twitch = require('./twitch');
var justyo = require('./justyo');

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('main.db');

db.serialize(function() {
  db.run("CREATE TABLE if not exists users (twitchName VARCHAR(31) NOT NULL, twitchAccessToken VARCHAR(255) NOT NULL, yoName VARCHAR(63), isActive BIT(1) NOT NULL, lastModified INT NOT NULL, PRIMARY KEY (twitchName))");
  db.run("CREATE TABLE if not exists alerts (streamId VARCHAR(255) NOT NULL, twitchName VARCHAR(31) NOT NULL)");
}); // Yo usernames are limited to 60 characters it seems

var routes = require('./routes/index');
var auth = require('./routes/auth');
var settings = require('./routes/settings');

var app = express();

//app.listen(config.web.port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: config.sessions.secret,
  resave: false,
  saveUninitialized: true
}));

app.use('/', routes);
app.use('/auth', auth);
app.use('/me', settings);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var followWorker = function(){
  console.log("RUNNING FOLLOW JOB")
  var usersStmt = db.prepare("SELECT * FROM users WHERE isActive=?");
  usersStmt.each(1, function(err, userRow) {

    twitch.getFollowedStreams(userRow.twitchAccessToken, function(streamData) {
      var streams = (typeof streamData.streams !== 'object') ? [] : streamData.streams;

      for (var j = 0; j < streams.length; j++) {

        //TODO this is NOT how you deepcopy
        var stream = JSON.parse(JSON.stringify(streams[j]));
        console.log(stream.channel.display_name);

        var getStmt = db.prepare("SELECT * FROM alerts WHERE streamId=? AND twitchName=?");
        getStmt.get(stream._id, userRow.twitchName, function(err, alertRow) {
          if (typeof alertRow === 'undefined') {
            //justyo.yo(userRow.yoName, function(yoid){}, stream.channel.url);


            var insertStmt = db.prepare("INSERT INTO alerts (streamId, twitchName) VALUES (?, ?)");
            insertStmt.run(stream._id, userRow.twitchName);
            insertStmt.finalize();
          }
        });
        getStmt.finalize();

      }
    });
  });
  usersStmt.finalize();

};

followWorker();

//setInterval(followWorker, 300000);


module.exports = app;
