import _ from './lodash-utils';
import Debug from 'debug';
import fs from 'fs';
import Router from 'koa-oai-router';
import swaggerParser from 'swagger-parser';
import jsonSchema from 'mongoose-schema-jsonschema';
import Promise from 'bluebird';

global.Promise = Promise;

import {prefixFilePath} from './util';
import Controller from './controller';

const debug = Debug('koa-oai-mongoose');

export default class MongoseRouter extends Router {
  constructor(opts) {
    opts.enableParser = false;

    super(opts);

    if (_.isArray(opts.mongo))
      this.mongo = opts.mongo;
    else
      this.mongo = [opts.mongo];

    this.apiDocOrigin = this.apiDoc;
    this.apiDoc = prefixFilePath(this.apiDoc, 'mongo-');

    _.each(this.mongo, (mongo)=> {jsonSchema(mongo.base);})

    this.jsonSchemaFormatters = {
      json: (data, schema)=> {
        try {
          JSON.parse(data);
          return true;
        } catch (error) {
          return false;
        }
      }
    };

    swaggerParser.validate(this.apiDocOrigin, {validate: {schema: false, spec: false}})
    .then((api)=> {
      for (let mongo of this.mongo) {
        for (let modelName of mongo.modelNames()) {
          debug(`Find collection [${modelName}] in [${mongo.name}] datebase.`);

          const controller = new Controller(mongo.name, mongo.model(modelName), );
          const paths = controller.defaultPaths();

          api.paths = _.merge(api.paths, paths);
        }
      }

      this.api = api;
      this._saveToApiDoc_(api);

      super.init(api);
    })
  }

  _saveToApiDoc_(api) {
    const content = JSON.stringify(api);
    fs.writeFileSync(this.apiDoc, content);
  }
}
