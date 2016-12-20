var Koa = require('koa');
var bodyParser = require('koa-bodyparser');
var logger = require('koa-logger');

var Router = require('../dist/mongoose').default;
var connection = require('./models');

var app = new Koa();

var server = app.listen(9000);

var opt = {
  apiDoc: './example/api/api.yaml',
  controllerDir: './example/controller',
  port: server.address().port,
  versioning: true,

  mongo: connection
};

var router = new Router(opt);

app.use(logger());
app.use(bodyParser());

app.use(router.routes());
app.use(router.apiExplorer());
