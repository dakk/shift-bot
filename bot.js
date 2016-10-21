var config = require ('./config.json');
var log = require ('./log');
var morgan = require ('morgan');
var TelegramBot = require('node-telegram-bot-api');

process.on('uncaughtException', function (err) {
	console.log ('Except', err.stack);
});

var bot = new TelegramBot (config.telegram.token, {polling: true});

bot.onText(/\/ping/, function (msg) {
	log.debug('Ping', msg);
	var fromId = msg.from.id;
	bot.sendMessage(fromId, 'Pong :D');
});

bot.onText(/\/balance (.+)/, function (msg, params) {
	log.debug('Balance', msg);
	log.debug('Balance', params[1]);
	var fromId = msg.from.id;
	bot.sendMessage(fromId, 'Asking for balance :D');
});

bot.onText(/\/rank (.+)/, function (msg, match) {
	log.debug('Rank', msg);
	log.debug('Rank', match[1]);
	var fromId = msg.from.id;
	bot.sendMessage(fromId, 'Asking for rank :D');
});
