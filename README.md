# Koa-OAI-Mongoose

[![License][license-img]][license-url]
[![NPM Version][npm-img]][npm-url]
[![Node Version][node-image]][node-url]
[![Build Status][travis-img]][travis-url]
[![Test Coverage][coveralls-img]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]
[![Dependency Status][david-img]][david-url]

[![NPM](https://nodei.co/npm/koa-oai-mongoose.png?downloads=true&stars=true)](https://nodei.co/npm/koa-oai-mongoose/)

[travis-img]: https://travis-ci.org/BiteBit/koa-oai-mongoose.svg?branch=master
[travis-url]: https://travis-ci.org/BiteBit/koa-oai-mongoose
[coveralls-img]: https://coveralls.io/repos/github/BiteBit/koa-oai-mongoose/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/BiteBit/koa-oai-mongoose?branch=master
[npm-img]: https://img.shields.io/npm/v/koa-oai-mongoose.svg
[npm-url]: https://npmjs.org/package/koa-oai-mongoose
[david-img]: https://img.shields.io/david/BiteBit/koa-oai-mongoose.svg
[david-url]: https://david-dm.org/BiteBit/koa-oai-mongoose
[downloads-image]: https://img.shields.io/npm/dm/koa-oai-mongoose.svg
[downloads-url]: https://npmjs.org/package/koa-oai-mongoose
[license-img]: http://img.shields.io/badge/license-MIT-green.svg
[license-url]: http://opensource.org/licenses/MIT
[node-image]: https://img.shields.io/badge/node.js-v4.0.0-blue.svg
[node-url]: http://nodejs.org/download/

[中文](./README.zh-CN.md)    [English](./README.md)


# Features
* Built-in Swagger-UI, easy view and debug
* Auto generate route by OpenAPI/Swagger api doc, and validate parameters
* Support OpenAPI/Swagger2.0 Specification with yaml or json file
* Support Json Schema v4, validate query,body,path,header
* Support custom Json Schema format
* Support custom error handler
* Autogenerate CRUD api for mongoose connection
* Support custom api for mongoose schema

# Installation

> For koa@>=2.x:

```bash
npm install koa-oai-mongoose --save
```

> For koa@<2.x:

**Not Support Yet!**

# Quick Start

**Because this module based on [koa-oai-router](https://github.com/BiteBit/koa-oai-router), so you must read it before.**

This example's source code is

## Creating model

You must create mongoose schema, model and connection at first. So create **mongo.js** with content below.

```js
import mongoose from 'mongoose';

const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/koa_oai_mongoose');

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  author: {
    ref: 'people',
    type: mongoose.Schema.Types.ObjectId,
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'mike',
    index: true,
    unique: true
  },
  age: Number,
  email: String,
  address: String,
  male: Boolean,
  bornAt: {
    type: Date,
    default: new Date()
  },
  likes: [String]
});

connection.model('user', userSchema);
connection.model('book', bookSchema);

export default connection;
```



## Creating api doc

Create a simple **api.yaml** api doc with some base info.

```yaml
swagger: '2.0'
info:
  version: 1.0.0
  title: koa-oai-mongoose example
consumes:
  - application/json
produces:
  - application/json
basePath: /api
paths:
```



## Creating koa app

Create **app.js** with content below.

```js
import Koa from 'koa';
import Router from 'koa-oai-mongoose';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';

import connection from './mongo';

const app = new Koa();

const server = app.listen(9000);

const opt = {
  apiDoc: './example/api/api.yaml',
  controllerDir: './example/controller',
  port: server.address().port,
  versioning: true,
  mongo: connection
};

const router = new Router(opt);

app.use(logger());
app.use(bodyParser());

app.use(router.routes());
app.use(router.apiExplorer());
```



## Explorering your api

At this moment, you can open api explorer **http://127.0.0.1:9001/api-explorer**.

