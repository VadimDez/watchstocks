'use strict';

class stockService {
  constructor($http) {
    this.$http = $http;
  }

  get(name) {
    return this.$http.get(`/api/stocks/${name}`);
  }

  create(name) {
    return this.$http.post('/api/stocks', { name: name });
  }

  remove(stock) {
    this.$http.delete('/api/stocks/' + stock._id);
  }
}

angular.module('watchstocksApp')
  .service('stockService', stockService);
