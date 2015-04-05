var request = require('request');
var config = require('./config');

var twitch = {};

twitch.baseRequest = request.defaults({
  headers: {
    'Accept': 'application/vnd.twitchtv.v3+json',
    'Client-ID': config.twitch.clientId
  }
});

twitch.getOauthRequest = function(accessToken) {
  var twi = this;
  return (twi.baseRequest).defaults({
    headers: {
      'Authorization': 'OAuth ' + accessToken
    }
  });
}

/**
 * Either parses a Twitch response into an object,
 * or returns an HTTP status code (or -1) if there's an error
 */
twitch.handleErrors = function(error, response, body) {

    if (error) return -1;

    if (response.statusCode != 200) return response.statusCode;

    var data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      return -1;
    }

    if (typeof data.error !== 'undefined') {
      return (typeof data.status === 'number') ? data.status : -1;
    }

    return data;
}

/**
 * Gets the URL a user must access to authenticate via Twitch
 */
twitch.getLoginUrl = function() {
  return config.twitch.apiRoot +
    "/oauth2/authorize" +
    "?response_type=code" +
    "&client_id=" + config.twitch.clientId +
    "&redirect_uri=" + config.twitch.redirectUri +
    "&scope=" + config.twitch.scope;
}

/**
 * Returns whether or not a username is a valid Twitch name
 */
twitch.validateUsername = function(username) {
  var pattern = /^[A-Z0-9\-_]{4,25}$/i;
  return pattern.test(username);
}

/**
 * Attempts to get an access token for a user who tried to log in
 * 
 * Calls callback with a single parameter. The parameter should
 * be the object from the API response. This function will verify
 * that the object includes an access_token. A refresh_token and
 * scopes array are also expected, but not verified to exist.
 * 
 * If an error occurred, it will instead return the HTTP status code
 * (if there is no code available for the error, it'll be -1).
 */
twitch.authNewUser = function(code, callback) {
  var twi = this;

  (twi.baseRequest).post({
    url: config.twitch.apiRoot + '/oauth2/token',
    form: {
      client_id: config.twitch.clientId,
      client_secret: config.twitch.clientSecret,
      grant_type: "authorization_code",
      redirect_uri: config.twitch.redirectUri,
      code: code
    }
  }, function(error, response, body) {

    var data = twi.handleErrors(error, response, body);

    if (typeof data !== 'object') {
      callback(data);
      return;
    }

    if (typeof data.access_token !== 'string') {
      callback(-1);
      return;
    }

    callback(data);

  });
}

/**
 * Make any basic GET call to the Twitch API
 *
 * Parameters:
 * - endpoint: Twitch API endpoint to call (e.g. "/user")
 * - callback: function to call with the resulting json or error code
 * - oauthToken: OAuth access token (optional; won't use OAuth if unset)
 */
twitch.makeGetRequest = function(endpoint, callback, oauthToken) {
  var twi = this;

  var request = null;
  if (oauthToken === false) {
    request = twi.baseRequest;
  } else {
    request = twi.getOauthRequest(oauthToken);
  }

  request.get({
    url: config.twitch.apiRoot + endpoint
  }, function(error, response, body) {

    var data = twi.handleErrors(error, response, body);

    callback(data);

  });
}


twitch.getUserByToken = function(accessToken, callback) {
  var twi = this;

  twi.makeGetRequest("/user", callback, accessToken);
}


// unused and thus untested
twitch.getUserByName = function(username, callback) {
  var twi = this;

  if (!twi.validateUsername(username)) {
    callback(-1);
  } else {
    twi.makeGetRequest("/user/" + username, callback);
  }
}

// TODO support for following more than 100 streams
twitch.getFollowedStreams = function(accessToken, callback) {
  var twi = this;

  twi.makeGetRequest("/streams/followed?limit=100&offset=0", function(data){

    // if (typeof data.streams !== 'object' || !Array.isArray(data.streams)) {
    //   callback(-1);
    //   return;
    // }
    callback(data);

  }, accessToken);

}


module.exports = twitch;