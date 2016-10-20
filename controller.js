var log = require ('./log');

exports.home = function(req, res){
    log.debug('Home', 'Controller func test');
    res.send('halo');
};

exports.test = function(req, res){
    res.send('halo2');
    log.debug('test', 'Controller func test');
};
