var mongoose = require('mongoose');

var connection = mongoose.createConnection('mongodb://127.0.0.1:27017/koa-oai-mongoose');

module.exports = connection;

require('./user');
require('./book');
