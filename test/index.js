import _ from 'lodash';
import test from 'ava';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import request from 'supertest';

import Router from '../lib/mongoose';
import conn from './fixtures/model';

let server = null;

const testId = '58cfed817882423292998534';

const TEST_USERS = [{
  "name": "test",
  "age": 12,
  "email": "test@github.com",
  "address": "shanghai, china",
  "male": true,
  "bornAt": "2000-12-19T16:14:32.257Z",
  "likes": [
    "test"
  ]
}, {
  "name": "bitebit",
  "age": 12,
  "email": "bitebit@github.com",
  "address": "shanghai, china",
  "male": true,
  "bornAt": "2000-12-19T16:14:32.257Z",
  "likes": [
    "bitebit"
  ]
}, {
  "name": "kiki",
  "age": 12,
  "email": "kiki@github.com",
  "address": "shanghai, china",
  "male": true,
  "bornAt": "2000-12-19T16:14:32.257Z",
  "likes": [
    "bitebit"
  ]
}]

test.cb.before(t => {
  const app = new Koa();

  const opt = {
    apiDoc: `${__dirname}/fixtures/api/api.yaml`,
    controllerDir: `${__dirname}/fixtures/controller`,
    apiExplorerVisible: false,
    mongo: conn
  };

  const router = new Router(opt);
  server = app.listen();

  app.use(bodyParser());
  app.use(router.routes());

  setTimeout(t.end, 500);
})

test.cb('DROP DATABASE /v1/api/koa_oai_mongoose_test/user/drop', t => {
  request(server)
    .delete('/v1/api/koa_oai_mongoose_test/user/drop')
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.deepEqual(res.body, {success: true});
      t.end();
    });
})

test.cb('DROP DATABASE /v1/api/koa_oai_mongoose_test/book/drop', t => {
  request(server)
    .delete('/v1/api/koa_oai_mongoose_test/book/drop')
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.deepEqual(res.body, {success: true});
      t.end();
    });
})

test.cb('FIND USER /v1/api/koa_oai_mongoose_test/user', t => {
  request(server)
    .get('/v1/api/koa_oai_mongoose_test/user')
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.deepEqual(res.body, []);
      t.end();
    });
})

test.cb('NEW USER /v1/api/koa_oai_mongoose_test/user', t => {
  const data = _.cloneDeep(TEST_USERS);
  data[0]._id = testId;

  request(server)
    .post('/v1/api/koa_oai_mongoose_test/user')
    .send(data)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.deepEqual(TEST_USERS, _.map(res.body, (it)=> {return _.pick(it, ['name', 'age', 'email', 'address', 'male', 'bornAt', 'likes'])}));
      t.end();
    });
})

test.cb('COUNT USER /v1/api/koa_oai_mongoose_test/user/count', t => {
  request(server)
    .get('/v1/api/koa_oai_mongoose_test/user/count')
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.is(res.body.count, TEST_USERS.length);
      t.end();
    });
})

test.cb('PAGE USER /v1/api/koa_oai_mongoose_test/user/page', t => {
  request(server)
    .get('/v1/api/koa_oai_mongoose_test/user/page')
    .query({
      where: JSON.stringify({male: true}),
      fields: JSON.stringify({_id: 0, __v: 0}),
      sort: JSON.stringify({name: -1}),
      page: 1,
      size: 1,
      populate: JSON.stringify({path: 'user'})
    })
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.is(res.body.page, 1);
      t.is(res.body.size, 1);
      t.is(res.body.total, TEST_USERS.length);
      t.is(res.body.pageCount, TEST_USERS.length);
      t.end();
    });
})

test.cb('FIND USER /v1/api/koa_oai_mongoose_test/user', t => {
  request(server)
    .get('/v1/api/koa_oai_mongoose_test/user')
    .query({
      where: JSON.stringify({male: true}),
      fields: JSON.stringify({_id: 0, __v: 0}),
      skip: 1,
      limit: 1,
      populate: JSON.stringify({path: 'user'})
    })
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.is(res.body.length, 1);
      t.end();
    });
})

test.cb('FIND USER INVALID FORM /v1/api/koa_oai_mongoose_test/user', t => {
  request(server)
    .get('/v1/api/koa_oai_mongoose_test/user')
    .query({
      where: '{key: 123}',
      fields: JSON.stringify({_id: 0, __v: 0}),
      sort: JSON.stringify({name: -1}),
      skip: 1,
      limit: 1,
      populate: JSON.stringify({path: 'user'})
    })
    .expect(400)
    .end(function(err, res) {
      if (err) throw err;
      t.end();
    });
})

test.cb('FINDONE USER /v1/api/koa_oai_mongoose_test/user/findOne with query object', t => {
  request(server)
    .get('/v1/api/koa_oai_mongoose_test/user/findOne')
    .query({
      where: {name: 'kiki'},
      fields: {_id: 0, __v: 0}
    })
    .expect(400)
    .end(function(err, res) {
      t.not(err, null);
      t.end();
    });
})

test.cb('FINDONE USER /v1/api/koa_oai_mongoose_test/user/findOne with query string', t => {
  request(server)
    .get('/v1/api/koa_oai_mongoose_test/user/findOne')
    .query({
      where: JSON.stringify({name: 'kiki'}),
      fields: JSON.stringify({_id: 0, __v: 0})
    })
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.deepEqual(res.body, TEST_USERS[2]);
      t.end();
    });
})

test.cb('CAN NOT FINDONE USER /v1/api/koa_oai_mongoose_test/user/findOne', t => {
  request(server)
    .get('/v1/api/koa_oai_mongoose_test/user/findOne')
    .query({
      where: JSON.stringify({name: 'kiki1234'}),
      fields: JSON.stringify({_id: 0, __v: 0})
    })
    .expect(404)
    .end(function(err, res) {
      t.deepEqual(res.body, {});
      t.end();
    });
})

test.cb('FIND ONE USER UPDATE /v1/api/koa_oai_mongoose_test/user/findOneAndUpdate', t => {
  request(server)
    .put('/v1/api/koa_oai_mongoose_test/user/findOneAndUpdate')
    .query({
      where: JSON.stringify({name: 'kiki'}),
      fields: JSON.stringify({_id: 0, __v: 0})
    })
    .send({
      $inc: {
        age: 1
      },
      address: 'BeiJin'
    })
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.is(res.body.address, 'BeiJin');
      t.is(res.body.age, TEST_USERS[1].age + 1);
      t.end();
    });
})

test.cb('CANT NOT FIND ONE USER UPDATE /v1/api/koa_oai_mongoose_test/user/findOneAndUpdate', t => {
  request(server)
    .put('/v1/api/koa_oai_mongoose_test/user/findOneAndUpdate')
    .query({
      where: JSON.stringify({name: 'kikiasdf'}),
      fields: JSON.stringify({_id: 0, __v: 0})
    })
    .send({
      $inc: {
        age: 1
      },
      address: 'BeiJin'
    })
    .expect(404)
    .end(function(err, res) {
      t.deepEqual(res.body, {});
      t.end();
    });
})

test.cb('PUT /v1/api/koa_oai_mongoose_test/user', t => {
  request(server)
    .put('/v1/api/koa_oai_mongoose_test/user')
    .query({
      where: JSON.stringify({name: 'bitebit'}),
      options: JSON.stringify({new: true})
    })
    .send({
      $inc: {
        age: 2
      },
      address: 'BeiJin'
    })
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.is(res.body.ok, 1);
      t.is(res.body.nModified, 1);
      t.is(res.body.n, 1);
      t.end();
    });
})

test.cb('DELETE /v1/api/koa_oai_mongoose_test/user', t => {
  request(server)
    .delete('/v1/api/koa_oai_mongoose_test/user')
    .query({
      where: JSON.stringify({name: 'bitebit'})
    })
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.is(res.body.ok, 1);
      t.is(res.body.n, 1);
      t.end();
    });
})

test('GET /v1/api/koa_oai_mongoose_test/user/{id}', async (t) => {
  const ret = await request(server)
    .get(`/v1/api/koa_oai_mongoose_test/user/${testId}`)

  console.log(ret.body);
  t.is(ret.body.name === 'test', true);
})

test('UPDATE /v1/api/koa_oai_mongoose_test/user/{id}', async (t) => {
  const ret = await request(server)
    .put(`/v1/api/koa_oai_mongoose_test/user/${testId}`)
    .send({
      name: 'gfgj',
    });

  console.log(ret.body);
  t.is(ret.body.name, 'gfgj');
})

test('DELETE /v1/api/koa_oai_mongoose_test/user/{id}', async (t) => {
  const ret = await request(server)
    .delete(`/v1/api/koa_oai_mongoose_test/user/${testId}`)

  console.log(ret.body);
  t.is(ret.body.ok, 1);
  t.is(ret.body.n, 1);
})

test.cb('NEW BOOK /v1/api/koa_oai_mongoose_test/book', t => {
  const BOOK = {
    name: 'Game Of Dota'
  }

  request(server)
    .get('/v1/api/koa_oai_mongoose_test/user/findOne')
    .query({
      where: JSON.stringify({name: 'kiki'}),
      fields: JSON.stringify({_id: 1})
    })
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      BOOK.author = res.body._id;
      request(server)
        .post('/v1/api/koa_oai_mongoose_test/book')
        .send([BOOK])
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;

          t.truthy(!!res.body[0].author);
          t.end();
        });
    });
})

test.cb('FINDONE BOOK /v1/api/koa_oai_mongoose_test/user/findOne WITH POPULATE', t => {
  request(server)
    .get('/v1/api/koa_oai_mongoose_test/book/findOne')
    .query({
      populate: JSON.stringify({
        path: 'author'
      })
    })
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      request(server)
        .get('/v1/api/koa_oai_mongoose_test/user/findOne')
        .query({
          where: JSON.stringify({name: 'kiki'})
        })
        .expect(200)
        .end(function(err, resUser) {
          if (err) throw err;

          t.deepEqual(_.omit(res.body.author, ['_id', '__v']), _.omit(resUser.body, ['_id', '__v']));
          t.end();
        });
    });
})

test.cb('DROP DATABASE /v1/api/koa_oai_mongoose_test/book/drop', t => {
  request(server)
    .delete('/v1/api/koa_oai_mongoose_test/book/drop')
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.deepEqual(res.body, {success: true});
      t.end();
    });
})

test.cb('DROP DATABASE /v1/api/koa_oai_mongoose_test/user/drop', t => {
  request(server)
    .delete('/v1/api/koa_oai_mongoose_test/user/drop')
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;

      t.deepEqual(res.body, {success: true});
      t.end();
    });
})
