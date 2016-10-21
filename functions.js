/**
 * Created by andreafspeziale on 21/10/16.
 */
var log = require ('./log');
var request = require ('request');
var config = require('./config.json');

var del;

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
                log.critical("Something went wrong", JSON.stringify(error));
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
                log.critical("Something went wrong", JSON.stringify(error));
            }
            reject(false);
        });
    });
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
                reject(false);
            })
        }, function (err) {
            console.log(err);
            reject(false);
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
        })
    })
};

