'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var StockSchema = new mongoose.Schema({
  name: String,
  code: String
});

export default mongoose.model('Stock', StockSchema);
