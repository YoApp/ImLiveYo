var config = {};

config.twitch = {};
config.web = {};

config.twitch.redirectUri   = process.env.TWITCH_REDIRECT_URI || "http://localhost:3000/auth/"
config.twitch.clientId      = process.env.TWITCH_CLIENT_ID || "nj4s2qsn6eu6v3xxaia0pgocd97mtz7";
config.twitch.clientSecret  = process.env.TWITCH_CLIENT_SECRET || "secret"
config.twitch.scope         = process.env.TWITCH_SCOPE || "user_read";

config.web.port = process.env.WEB_PORT || 3000;

module.exports = config;