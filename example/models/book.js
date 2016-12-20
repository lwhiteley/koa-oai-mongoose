var mongoose = require('mongoose');

var conn = require('./index');

var bookSchema = new mongoose.Schema({
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
})

var bookModel = conn.model('book', bookSchema);

module.exports = bookModel;
