'use strict';

class stockService {
  constructor($http) {
    this.$http = $http;
  }

  get(name) {
    return this.$http.get(`/api/stocks/${name}`);
  }
}

angular.module('watchstocksApp')
  .service('stockService', stockService);
