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
    console.log("Command: " + msg.text + "\nAsked by: " + msg.from.username + "\nDate: " + msg.date + "\n\n");
	var fromId = msg.from.id;
	bot.sendMessage(fromId, 'Pong :D');
});


/**
 * Check official blockchain height
 */
bot.onText(/\/height/, function (msg) {
    console.log("Command: " + msg.text + "\nAsked by: " + msg.from.username + "\nDate: " + msg.date + "\n\n");
    var fromId = msg.from.id;
    functions.height().then(function(res) {
        bot.sendMessage(fromId, "The official blockchain height is "+res.height+" by wallet.shiftnrg.org");
    }, function (err) {
        bot.sendMessage(fromId, err);
    });
});

/**
 * Check delegate balance
 */
bot.onText(/\/balance (.+)/, function (msg, params) {
    console.log("Command: " + msg.text + "\nAsked by: " + msg.from.username + "\nDate: " + msg.date + "\n\n");
	var fromId = msg.from.id;
    functions.balance(params[1]).then(function(res) {
        bot.sendMessage(fromId, "Your balance is actually "+res);
    }, function (err) {
        bot.sendMessage(fromId, "Error, please enter a valid delegate name");
    });
});

/**
 * Check delegate rank
 */
bot.onText(/\/rank (.+)/, function (msg, params) {
    console.log("Command: " + msg.text + "\nAsked by: " + msg.from.username + "\nDate: " + msg.date + "\n\n");
	var fromId = msg.from.id;
    functions.rank(params[1]).then(function(res) {
        bot.sendMessage(fromId, "Your rank is actually "+res.rate);
    }, function (err) {
        bot.sendMessage(fromId, "Error, please enter a valid delegate name");
    });
});

/**
 * Check node blockchain status
 */
bot.onText(/\/status (.+)/, function (msg, params) {
    console.log("Command: " + msg.text + "\nAsked by: " + msg.from.username + "\nDate: " + msg.date + "\n\n");
    var fromId = msg.from.id;
    functions.status(params[1]).then(function(res) {
        bot.sendMessage(fromId, "Syncing: " + res.syncing + "\nBlocks: " + res.blocks + "\nHeight: " + res.height);
    }, function (err) {
        bot.sendMessage(fromId, err);
    });
});

/**
 * Start / stop delegate forging monitoring
 */
bot.onText(/\/watch (.+)/, function(msg, params) {
    console.log("Command: " + msg.text + "\nAsked by: " + msg.from.username + "\nDate: " + msg.date + "\n\n");
    var fromId = msg.from.id;
    var command = params[1].split(" ")[0];
    var delegate = params[1].split(" ")[1];
    functions.monitoring(command, delegate, fromId).then(function(res) {
        bot.sendMessage(fromId, res);
    }, function(err) {
        console.log(err);
        bot.sendMessage(fromId, err);
    });
});

/**
 * List watching list
 */



/**
 * List votes received
 */


/**
 * List votes made
 */



functions.checkBlocks ();
setInterval (checkBlocks, 10000);
