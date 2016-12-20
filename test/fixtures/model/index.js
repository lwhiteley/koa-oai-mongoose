import mongoose from 'mongoose';

import userSchema from './user';
import bookSchema from './book';


const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/koa_oai_mongoose_test');

connection.model('user', userSchema);
connection.model('book', bookSchema);

export default connection;
