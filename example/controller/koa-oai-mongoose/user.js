var model = require('../../models/user');

function luck(ctx, next) {
  return model.findOne()
  .then((docs)=> {
    ctx.response.body = docs;
  })
  .catch((error)=> {
    ctx.throw(500, error);
  })
}

module.exports = {
  luck: luck
};
