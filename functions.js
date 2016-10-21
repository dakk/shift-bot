/**
 * Created by andreafspeziale on 21/10/16.
 */
var log = require ('./log');
var request = require ('request');
var config = require('./config.json');

var del;
var defaultNode = "wallet.shiftnrg.org";

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
                        console.log(delegates.delegates[i]);
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

/**
 *
 * @param node
 * @returns {Promise}
 * Check blockchain statu for a given node
 */
var checkNodeStatus = function (node) {
    return new Promise(function (resolve, reject) {
        if (node.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
            // the ip is valid, so check the status

        } else {
            // the ip is not valid
        }
    })
}

/**
 *
 * @returns {Promise}
 * Check official blockchain height
 */
var checkOfficialHeight = function() {
    console.log('checkOfficialHeight');
    return new Promise(function (resolve, reject) {
        request('http://' + config.node + '/api/loader/status/sync', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(JSON.parse(body));
                var status = JSON.parse(body);
                console.log(status);
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
        });
    });
};

exports.status = function (node) {
    return new Promise(function (resolve, reject) {
        checkNodeStatus(node).then(function (res) {

        }, function (err) {

        });
    });
};

