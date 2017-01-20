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



# 特性
* 内置Swagger-UI，方便查看、调试接口
* 使用OpenAPI/Swagger API文档自动生成Koa路由，并支持参数校验
* 支持OpenAPI/Swagger2.0规范，支持json、yaml格式
* 支持基于JsonSchema V4的接口query、body、path、header参数校验
* 支持自定义JsonSchema format校验
* 支持自定义接口错误处理
* 自动识别mongoose连接上的集合并生成CRUD接口
* 支持多个mongoose连接
* 支持扩展mongoose集合的接口

# 安装

> For koa@>=2.x (next):

```bash
npm install koa-oai-mongoose@next --save
```

> For koa@<2.x:

**暂不支持！**



# 快速上手

