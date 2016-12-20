import mongoose from 'mongoose';

var bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  author: {
    ref: 'user',
    type: mongoose.Schema.Types.ObjectId,
  }
})

export default bookSchema;
