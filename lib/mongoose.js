import _ from 'lodash';
import Debug from 'debug';
import fs from 'fs';
import Router from 'koa-oai-router';
import swaggerParser from 'swagger-parser';
import jsonSchema from 'mongoose-schema-jsonschema-x';
import Promise from 'bluebird';

global.Promise = Promise;

import {prefixFilePath} from './util';
import Controller from './controller';

const debug = Debug('koa-oai-mongoose');

export default class MongoseRouter extends Router {
  constructor(opts) {
    opts.enableParser = false;

    super(opts);

    this.mongo = opts.mongo;
    this.apiDocOrigin = this.apiDoc;
    this.apiDoc = prefixFilePath(this.apiDoc, 'mongo-');

    jsonSchema(this.mongo.base);

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
      for (let modelName of opts.mongo.modelNames()) {
        debug(`Find collection [${modelName}] in [${opts.mongo.name}] datebase.`);

        const controller = new Controller(this.mongo.model(modelName));
        const paths = controller.defaultPaths();

        api.paths = _.merge(api.paths, paths);
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
