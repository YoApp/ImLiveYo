var config = {};

config.twitch = {};
config.justyo = {};
config.web = {};
config.sessions = {};

config.twitch.redirectUri = process.env.TWITCH_REDIRECT_URI || "http://localhost:3000/auth/login/";
config.twitch.clientId = process.env.TWITCH_CLIENT_ID || "nj4s2qsn6eu6v3xxaia0pgocd97mtz7";
config.twitch.clientSecret = process.env.TWITCH_CLIENT_SECRET || "secret";
config.twitch.scope = process.env.TWITCH_SCOPE || "user_read";
config.twitch.apiRoot = process.env.TWITCH_API_ROOT || "https://api.twitch.tv/kraken";

config.justyo.apiToken = process.env.JUSTYO_API_TOKEN || "secret";
config.justyo.apiRoot = process.env.JUSTYO_API_ROOT || "http://api.justyo.co";

config.web.port = process.env.WEB_PORT || 3000;

config.sessions.secret = process.env.SESSIONS_SECRET || "QWERTYUIOP1234567890";

module.exports = config;