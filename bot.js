var config = require('./config.json');
var log = require('./log');
var morgan = require('morgan');
var functions = require('./functions');
var TelegramBot = require('node-telegram-bot-api');

process.on('uncaughtException', function (err) {
	console.log ('Except', err.stack);
});

var bot = new TelegramBot (config.telegram.token, {polling: true});


/**
 * Check bot status
 */
bot.onText(/\/ping/, function (msg) {
	var fromId = msg.from.id;
	bot.sendMessage(fromId, 'Pong :D');
});

/**
 * Check delegate balance
 */
bot.onText(/\/balance (.+)/, function (msg, params) {
	var fromId = msg.from.id;
    functions.balance(params[1]).then(function(res) {
        bot.sendMessage(fromId, res.balance);
    }, function (err) {
        bot.sendMessage(fromId, "Error, please enter a valid delegate name");
    });
});

/**
 * Check delegate rank
 */
bot.onText(/\/rank (.+)/, function (msg, match) {
	log.debug('Rank', msg);
	log.debug('Rank', match[1]);
	var fromId = msg.from.id;
	bot.sendMessage(fromId, 'Asking for rank :D');
});
