import mongoose from 'mongoose';

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
  password: String,
  male: Boolean,
  bornAt: {
    type: Date,
    default: new Date()
  },
  likes: [String]
})

export default userSchema;
