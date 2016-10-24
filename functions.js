/**
 * Created by andreafspeziale on 21/10/16.
 */
var log = require ('./log');
var request = require ('request');
var config = require('./config.json');
var fs = require('fs');
var TelegramBot = require('node-telegram-bot-api');

var bot = new TelegramBot (config.telegram.token, {polling: true});

var del;
var delegateList = [];
var alerted = {};
var alive = {};


/**
 * Save or load delegate in monitor
 */
var saveDelegateMonitor = function () {
    return new Promise(function (resolve, reject) {
        fs.writeFile('monitor.json', JSON.stringify (delegateMonitor), function (err,data) {
            if(!err)
                resolve(true);
            else
                reject("Something wrong saving the delegate data");
        });
    })
};
var loadDelegateMonitor = function () {
    try {
        return JSON.parse (fs.readFileSync('monitor.json', 'utf8'));
    } catch (e) {
        return {};
    }
};

var delegateMonitor = loadDelegateMonitor();

/**
 *
 * @param delegate
 * Check if delegate is in watching
 */
var isWatching = function (delegate) {
    return new Promise(function (resolve, reject) {
        if(delegate in delegateMonitor) {
            resolve(true);
        } else {
            reject(false);
        }
    })
}

/**
 *
 * @param delegate
 * Chek if is delegate or not
 */
var isDelegate = function (delegate) {
    return new Promise(function (resolve, reject) {
        request('http://' + config.node + '/api/delegates/?limit=101&offset=0&orderBy=rate:asc', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var delegates = JSON.parse(body);
                for (var i = 0; i < delegates.delegates.length; i++) {
                    if (delegate.indexOf (delegates.delegates[i].username) != -1) {
                        del = delegates.delegates[i];

                        resolve(true);
                    }
                }
            } else {
                console.log("isDelegate: something went wrong with the request\n\n");
            }
            reject(false);
        });
    });
};

/**
 *
 * @param delegate
 * Check delegate balance
 */
var checkBalance = function (delegate) {
    return new Promise(function (resolve, reject) {
        request('http://' + config.node + '/api/accounts/getBalance?address=' + del.address, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var balance = JSON.parse(body);
                resolve(balance);
            } else {
                console.log("checkBalance: something went wrong with the request\n\n");
                reject("checkBalance: something went wrong with the request\n\n");
            }
        })
    });
};

/**
 *
 * @param node
 * @returns {Promise}
 * Check blockchain statu for a given node
 */
var checkNodeStatus = function (node) {
    console.log('checkNodeStatus')
    return new Promise(function (resolve, reject) {
        if (node.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
            // the ip is valid, so check the status
            request('http://' + node + ':9305/api/loader/status/sync',{timeout: 3500}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    console.log("checkNodeStatus: there is some kind of problem with the IP\nIP: "+node+"\nError: "+error+"\n\n");
                    reject("There is some kind of problem with your IP.\nMaybe access permission.\nAdd my IP in your APIs whitelist.");
                }
            })
        } else {
            // the ip is not valid
            reject("The IP is not valid");
        }
    });
};

/**
 *
 * @returns {Promise}
 * Check official blockchain height
 */
var checkOfficialHeight = function() {
    return new Promise(function (resolve, reject) {
        request('http://' + config.node + '/api/loader/status/sync', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var status = JSON.parse(body);
                resolve(status);
            } else {
                reject("There is some kind of problem with the official node wallet.shiftnrg.org");
            }
        });
    });
};

exports.height = function () {
    return new Promise(function (resolve, reject) {
        checkOfficialHeight().then(function (res) {
            resolve(res);
        }, function (err) {
            reject(err);
        })
    })
};

exports.balance = function (delegate) {
    return new Promise(function (resolve, reject) {
        // checking if is a delegate
        isDelegate(delegate).then(function (res) {
            // checking delegate balance
            checkBalance(del).then(function (res) {
                resolve((Math.floor( (parseFloat(res.balance * Math.pow(10, -8))) * 100)/ 100).toLocaleString());
            }, function (err) {
                console.log(err);
                reject(err);
            })
        }, function (err) {
            console.log(err);
            reject(err);
        })
    })
};

exports.rank = function (delegate) {
    return new Promise(function (resolve, reject) {
        // checking if is a delegate
        isDelegate(delegate).then(function (res) {
            resolve(del);
        }, function (err) {
            console.log(err);
            reject(false);
        });
    });
};

exports.status = function (node) {
    return new Promise(function (resolve, reject) {
        checkNodeStatus(node).then(function (res) {
            console.log(res);
            resolve(res);
        }, function (err) {
            console.log(err);
            reject(err);
        });
    });
};

exports.monitoring = function (command, delegate, fromId){
    return new Promise(function (resolve, reject){
        if (command == "start" || command == "stop") {
            isDelegate(delegate).then(function (res) {
                if(command=="start") {
                    log.debug("monitoring func: ", "command start");
                    // check if is already in
                        isWatching(delegate).then(function (res) {
                            //if is in --> check if is asked from same chatId
                            if(delegateMonitor[delegate].indexOf (fromId) != -1){
                                // from same chat id
                                reject("Waching on " + delegate + " already activated");
                            } else {
                                // different chat id, so adding it to watching
                                delegateMonitor [delegate].push (fromId);
                                saveDelegateMonitor().then(function (res) {
                                    resolve("The watching has been activated for: " + delegate);
                                }, function (err) {
                                    reject(err);
                                })
                            }
                        }, function (err) {
                            //if is not in --> enable the watch
                            delegateMonitor [delegate] = [fromId];
                            saveDelegateMonitor().then(function (res) {
                                resolve("The watching has been activated for: " + delegate);
                            }, function (err) {
                                reject(err);
                            })
                        })
                } else {
                    log.debug("monitoring func: ", "command stop");
                    // check if is already in
                    isWatching(delegate).then(function (res) {
                        // check chat id
                        if( (i = (delegateMonitor[delegate].indexOf (fromId))) != -1){
                            // from same chat id
                            delegateMonitor[delegate].splice (i, 1);
                            saveDelegateMonitor().then(function (res) {
                                resolve("The monitoring for " + delegate + " has been stopped");
                            }, function (err) {
                                reject(err);
                            })
                        } else {
                            // different chat id, so adding it to watching
                            reject("The monitoring for " + delegate + " has never been activated");
                        }
                    }, function (err) {
                        //if is not in --> watch has been never activated
                        reject("The monitoring for " + delegate + " has never been activated");
                    })
                }
            }, function (err) {
                reject("Error, please enter a valid delegate name");
            });
        } else {
            log.debug("monitoring func: ", "command rejected");
            reject("Command rejected.\nYou can only start or stop monitoring your node.")
        }
    });
}

var checkBlocks = function() {
    // blocks scheduler for alerts
    request('http://' + config.node + '/api/delegates/?limit=101&offset=0&orderBy=rate:asc', function (error, response, body) {
        // getting all delegates
        if (!error && response.statusCode == 200) {
            var res = JSON.parse(body);
            for (var i = 0; i < res.delegates.length; i++) {
                // check if the delegate is in monitoring mode
                if (res.delegates[i].username in delegateMonitor) {
                    // if is in monitoring add to delegateList var
                    delegateList.push(res.delegates[i]);
                }
            }
            // checking blocks
            request('http://' + config.node + '/api/blocks?limit=100&orderBy=height:desc', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(alerted);
                    var data = JSON.parse(body);
                    // checking blocks shifting by 100
                    request('http://' + config.node + '/api/blocks?limit=100&offset=100&orderBy=height:desc', function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var data2 = JSON.parse(body);
                            data.blocks = data.blocks.concat(data2.blocks);
                            alive = {};
                            for (var i = 0; i < data.blocks.length; i++) {
                                alive [data.blocks[i].generatorId] = true;
                            }
                            for (var i = 0; i < delegateList.length; i++) {
                                if (! (delegateList[i].address in alive)) {
                                    alive [delegateList[i].address] = false;
                                    if (! (delegateList[i].address in alerted))
                                        alerted [delegateList[i].address] = 1;
                                    else
                                        alerted [delegateList[i].address] += 1;
                                    if (alerted [delegateList[i].address] == 1 || alerted [delegateList[i].address] % 180 == 0) {
                                        if (delegateList[i].username in delegateMonitor) {
                                            for (var j = 0; j < delegateMonitor [delegateList[i].username].length; j++) {
                                                console.log(alerted);
                                                console.log("bot sending message to ", delegateMonitor [delegateList[i].username][j]);
                                                console.log("with name ", delegateList[i].username);
                                                bot.sendMessage (delegateMonitor [delegateList[i].username][j], 'Warning! The delegate "' + delegateList[i].username + ' is in red state.');
                                        }}
                                    }
                                } else {
                                    delete alerted [delegateList[i].address];
                                }
                            }
                        } else {
                            console.log("Something wrong with get blocks API, second step");
                        }
                    });
                } else {
                    console.log("Something wrong with get blocks API, first step");
                }
            });
        } else {
            console.log("Something wrong with get delegates");
        }
    });
};

exports.startLoop = function () {
    checkBlocks ();
    setInterval (checkBlocks, 10000);
};
