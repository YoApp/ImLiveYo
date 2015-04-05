var request = require('request');
var config = require('./config');

var justyo = {};

/**
 * Sends a yo. Calls the callback function with the id of
 * the yo, or 'false' if an error occurred.
 *
 * The link parameter is optional
 */
justyo.yo = function(username, callback, link) {
  var formData = {
    'api_token': config.justyo.apiToken,
    'username': username
  };
  if (typeof link !== 'undefined') {
    formData.link = link;
  }

  request.post({
      url: config.justyo.apiRoot +  "/yo/",
      form: formData
    },
    function (error, response, body) {
      if (error || response.statusCode != 200) {
        console.log('error while yoing: ' + response.statusCode);
        callback(false);
        return;
      }

      var data = JSON.parse(body);
      if (typeof data.success === 'undefined'
        || !data.success
        || typeof data.yo_id === 'undefined') {
        console.log('error while yoing: bad api reply');
        callback(false);
        return;
      }

      callback(data.yo_id);
    }
  );
}

module.exports = justyo;