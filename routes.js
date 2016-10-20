var express	= require ('express');
var controller = require('./controller');

/** Routes */
var router = express.Router();
router.get('/', controller.home);
router.get('test', controller.test);

exports.router = router;
