var mongoose = require('mongoose');

var conn = require('./index');

var userSchema = new mongoose.Schema({
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
})

var userModel = conn.model('user', userSchema);

module.exports = userModel;
