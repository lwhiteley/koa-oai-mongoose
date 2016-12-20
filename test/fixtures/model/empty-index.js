import mongoose from 'mongoose';

const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/koa_oai_mongoose_test');

export default connection;
