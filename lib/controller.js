import _ from 'lodash';
import Debug from 'debug';
import urlJoin from 'url-join';

import {
  paramErrorSchema,
  defaultErrorSchema,
  countSchema,
  multiUpdateSchema} from './common-schema';

const debug = Debug('koa-oai-mongoose:controller');

export default class Controller {
  constructor(dbName, model) {
    this.dbName = dbName;
    this.model = model;
    this.tag = model.modelName;

    this.paths = null;

    this.schema = this.model.jsonSchema();
    this.schema.properties = _.omit(this.schema.properties, ['_id', '__v']);

    this.arraySchema = {
      type: 'array',
      items: this.schema
    }

    this.pageSchema = {
      type: 'object',
      required: ['items'],
      properties: {
        pageCount: {
          type: "number",
          description: 'total page count.'
        },
        page: {
          type: "number",
          description: 'current page index.'
        },
        size: {
          type: "number",
          description: 'page size count.'
        },
        total: {
          type: "number",
          description: 'total items count.'
        },
        items: {
         type: 'array',
         items: this.schema
        }
      }
    }

    this.functions = {
      create: 'create',
      find: 'find',
      page: 'page',
      count: 'count',
      drop: 'drop',
      remove: 'remove',
      update: 'update',
      findOne: 'findOne',
      findOneAndUpdate: 'findOneAndUpdate'
    };
  }

  addApi(method, endpoint, summary, parameters, responses, handler) {
    if (!!endpoint)
      endpoint = urlJoin('/' + this.dbName, this.tag, endpoint);
    else
      endpoint = urlJoin('/' + this.dbName, this.tag);

    if (!responses['400'])
      responses['400'] = {schema: paramErrorSchema};
    if (!responses.default)
      responses.default = {schema: defaultErrorSchema};

    let desc = {
      summary: summary,
      tags: [`${this.dbName}.${this.tag}`],
      'x-oai-controller': [{
        handler: handler(this.model)
      }],
      parameters: parameters,
      responses: responses
    };

    desc = _.set({}, method, desc);
    desc = _.set({}, endpoint, desc);
    return desc;
  }

  defaultPaths() {
    for (let funName in this.functions) {
      const schema = this[funName]();

      this.paths = _.merge(this.paths || {}, schema);
    }

    return this.paths;
  }

  create() {
    const params = [{
      in: 'body',
      name: 'data',
      type: 'object',
      schema: this.arraySchema,
      required: true
    }];

    const resps = {
      200: {
        schema: this.arraySchema
      }
    };

    function create(model) {
      return (ctx, next)=> {
        return model.insertMany(ctx.request.body)
        .then((docs)=> {
          ctx.response.body = docs;
        })
      }
    }

    return this.addApi('post', '', `Create ${this.tag}(s)`, params, resps, create);
  }

  find() {
    const params = [{
      name: 'where',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }, {
      name: 'fields',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }, {
      name: 'skip',
      type: 'number',
      format: 'int32',
      in: 'query',
      required: false,
      default: 0
    }, {
      name: 'limit',
      type: 'number',
      format: 'int32',
      in: 'query',
      required: false,
      default: 0
    }, {
      name: 'sort',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }, {
      name: 'populate',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }];

    const resps = {
      200: {
        schema: this.arraySchema
      }
    };

    function find(model) {
      return (ctx, next)=> {
        const query = _buildQuery_(model.find(), ctx.request.query);

        return query
        .then((docs)=> {
          ctx.response.body = docs;
        })
      }
    }

    return this.addApi('get', '', `Find ${this.tag}(s)`, params, resps, find);
  }

  page() {
    const params = [{
      name: 'where',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }, {
      name: 'fields',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }, {
      name: 'page',
      type: 'number',
      format: 'int32',
      in: 'query',
      required: false,
      default: 0
    }, {
      name: 'size',
      type: 'number',
      format: 'int32',
      in: 'query',
      required: false,
      default: 10
    }, {
      name: 'sort',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }, {
      name: 'populate',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }];

    const resps = {
      200: {
        schema: this.pageSchema
      }
    };

    function page(model) {
      return (ctx, next)=> {
        function pageHandler() {
          return Number(ctx.request.query.page) || 0;
        }

        function sizeHandler() {
          return Number(ctx.request.query.size) || 10;
        }

        function totalHandler() {
          ctx.request.query.skip = pageHandler() * sizeHandler()
          ctx.request.query.limit = sizeHandler();

          return _buildQuery_(model.count(), _.pick(ctx.request.query, ['where']))
          .then((data)=> {
            return data;
          });
        }

        function itemsHandler() {
          return _buildQuery_(model.find(), ctx.request.query)
          .then((data)=> {
            return data;
          });
        }

        return Promise.props({
          page: pageHandler(),
          size: sizeHandler(),
          total: totalHandler(),
          items: itemsHandler()
        })
        .then((ret)=> {
          ret.pageCount = Math.ceil(ret.total / ret.size);
          ctx.response.body = ret;
        })
      }
    }

    return this.addApi('get', 'page', `Page ${this.tag}`, params, resps, page);
  }

  count() {
    const params = [{
      name: 'where',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }];

    const resps = {
      200: {
        schema: countSchema
      }
    };

    function count(model) {
      return (ctx, next)=> {
        const query = _buildQuery_(model.count(), ctx.request.query);

        return query
        .then((count)=> {
          ctx.response.body = {count: count};
        })
      }
    }

    return this.addApi('get', 'count', `Count ${this.tag}`, params, resps, count);
  }

  findOne() {
    const params = [{
      name: 'where',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }, {
      name: 'fields',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }, {
      name: 'populate',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false
    }];

    const resps = {
      200: {
        schema: this.schema
      }
    };

    function findOne(model) {
      return (ctx, next)=> {
        const query = _buildQuery_(model.findOne(), ctx.request.query);

        return query
        .then((doc)=> {
          if (doc) {
            ctx.response.body = doc;
          } else {
            ctx.response.status = 404
            ctx.response.body = {};
          }
        })
      }
    }

    return this.addApi('get', 'findOne', `Find ${this.tag}`, params, resps, findOne);
  }

  findOneAndUpdate() {
    const schema = _.omit(this.schema, 'required');
    schema.minProperties = 1;

    const params = [{
      name: 'where',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false,
      description: 'Support all mongo where filter.'
    }, {
      name: 'options',
      type: 'string',
      in: 'query',
      required: false,
      description: 'Support mongoose options'
    }, {
      name: 'update',
      type: 'object',
      in: 'body',
      required: false,
      schema: schema,
      description: 'More then one filed should be input.'
    }];

    const resps = {
      200: {
        schema: this.schema
      }
    };

    function findOneAndUpdate(model) {
      return (ctx, next)=> {
        const where = JSON.parse(ctx.request.query.where || '{}');
        const options = JSON.parse(ctx.request.query.options || '{"new": true}');
        const update = ctx.request.body;

        debug('findOneAndUpdate: ', where, options, update);

        return model.findOneAndUpdate(where, update, options)
        .then((doc)=> {
          if (doc) {
            ctx.response.body = doc;
          } else {
            ctx.response.status = 404
            ctx.response.body = {};
          }
        })
      }
    }

    return this.addApi('put', 'findOneAndUpdate', `Update ${this.tag}`, params, resps, findOneAndUpdate);
  }

  update() {
    const schema = _.omit(this.schema, 'required');
    schema.minProperties = 1;

    const params = [{
      name: 'where',
      type: 'string',
      format: 'json',
      in: 'query',
      required: false,
      description: 'Support all mongo where filter.'
    }, {
      name: 'options',
      type: 'string',
      in: 'query',
      required: false,
      description: 'Support mongoose options'
    }, {
      name: 'update',
      type: 'object',
      in: 'body',
      required: false,
      schema: schema,
      description: 'More then one filed should be input.'
    }];

    const resps = {
      200: {
        schema: multiUpdateSchema
      }
    };

    function update(model) {
      return (ctx, next)=> {
        const where = JSON.parse(ctx.request.query.where || '{}');
        const options = JSON.parse(ctx.request.query.options || '{"new": true}');
        const update = ctx.request.body;

        debug('update: ', where, options, update);

        return model.update(where, update, options)
        .then((doc)=> {
          ctx.response.body = doc;
        })
      }
    }

    return this.addApi('put', '', `Update ${this.tag}(s)`, params, resps, update);
  }

  remove() {
    const params = [{
      name: 'where',
      type: 'string',
      format: 'json',
      in: 'query',
      required: true
    }];

    const resps = {
      200: {
        schema: multiUpdateSchema
      }
    };

    function remove(model) {
      return (ctx, next)=> {
        const query = _buildQuery_(model.remove(), ctx.request.query);

        return query
        .then((docs)=> {
          ctx.response.body = docs;
        })
      }
    }

    return this.addApi('delete', '', `Delete some ${this.tag}`, params, resps, remove);
  }

  drop() {
    const params = [];

    const resps = {
      200: {
        schema: this.schema
      }
    };

    function drop(model) {
      return (ctx, next)=> {
        return model.collection.drop()
        .then((doc)=> {
          ctx.response.body = {success: doc};
        })
      }
    }

    const schema = this.addApi('delete', 'drop', `Drop ${this.tag} database, dangerous!`, params, resps, drop);

    return schema;
  }
}

function _buildQuery_(query, opts) {
  const where = JSON.parse(opts.where || '{}');
  const fields = JSON.parse(opts.fields || '{}');
  const sort = JSON.parse(opts.sort || '{}');
  const skip = Number(opts.skip) || 0;
  const limit = Number(opts.limit) || 0;
  const populate = JSON.parse(opts.populate || '{}');

  debug(`Build query: `, where, fields, sort, skip, limit, populate);

  if (!_.isEmpty(where) && _.isObject(where))
    query.where(where);

  if (!_.isEmpty(fields) && _.isObject(fields))
    query.select(fields);

  if (!_.isEmpty(sort) && _.isObject(sort))
    query.sort(sort);

  if (skip)
    query.skip(skip);

  if (limit)
    query.limit(limit);

  if (!_.isEmpty(populate) && _.isObject(populate))
    query.populate(populate);

  return query;
}
