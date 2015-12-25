'use strict';

(function() {

class MainController {

  constructor($http, $scope, socket, $timeout, highchartsNG, stockService) {
    this.$http = $http;
    this.stockService = stockService;
    this.$timeout = $timeout;
    this.stocks = [];
    this.error_message = '';
    this.startDate = '0';
    this.endDate = '0';

    this.chartConfig = this.getHighStockConfig();

    $http.get('/api/stocks').then(response => {
      this.stocks = response.data;
      socket.syncUpdates('stock', this.stocks, (event, item) => {

        if (event === 'created') {
          this.onCreated(item.name);
        } else if (event === 'deleted') {
          this.onDeleted(item.name);
        }
      });

      this.stocks.forEach(stock => {
        this.getStock(stock.name);
      });
    });

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('stock');
    });

    highchartsNG.ready(function(){
      // init chart config, see lazyload example
    },this);
  }

  /**
   * On created socket callback
   * @param name
     */
  onCreated(name) {
    this.getStock(name);
  }

  /**
   * on deleted socket callback
   * @param name
     */
  onDeleted(name) {
    this.removeStock(name);
  }

  /**
   * Find and remove stock
   * @param name
     */
  removeStock(name) {
    var object = _.find(this.chartConfig.series, item => {
      return item.name.toUpperCase() === name.toUpperCase();
    });

    if (object) {
      this.chartConfig.series.splice(this.chartConfig.series.indexOf(object), 1);
    }
  }

  /**
   * Get stock data from api by name
   * @param name
     */
  getStock(name) {
    var serie = {
      name: name,
      data: []
    };
    this.stockService.get(name)
      .then(data => {

        //if (this.start_date)

        serie.data = data.data.dataset.data.reverse().map(info => {
          return [
            (new Date(info[0])).getTime(),
            info[1]
          ];
        });

        this.chartConfig.series.push(serie);
      })
      .catch(error => {
        if (typeof error === 'object' && error.quandl_error && error.quandl_error.code === 'QECx02') {
          this.error_message = 'Incorrect or not existing stock code';
        }
      });
  }

  addStock() {
    if (this.newStock) {
      this.$http.post('/api/stocks', { name: this.newStock.toUpperCase() });
      this.newStock = '';
    }
  }

  /**
   * Delete stock from db
   * @param stock
     */
  deleteStock(stock) {
    this.$http.delete('/api/stocks/' + stock._id);
  }

  /**
   * Get highcharts config object
   * @returns {{rangeSelector: {selected: number}, yAxis: {labels: {formatter: yAxis.labels.formatter}, plotLines: *[]}, plotOptions: {series: {compare: string}}, tooltip: {pointFormat: string, valueDecimals: number}, series: Array, title: {text: string}, loading: boolean, useHighStocks: boolean, size: {height: number}, func: func}}
     */
  getHighStockConfig() {
    return {
      rangeSelector: {
        selected: 4
      },

      yAxis: {
        labels: {
          formatter: function () {
            return (this.value > 0 ? ' + ' : '') + this.value + '%';
          }
        },
        plotLines: [{
          value: 0,
          width: 2,
          color: 'silver'
        }]
      },

      plotOptions: {
        series: {
          compare: 'value'
        }
      },

      tooltip: {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
        valueDecimals: 2
      },

      series: [],

      title: {
        text: 'Stocks'
      },
      loading: false,
      /*xAxis: {
       currentMin: 0,
       currentMax: 20,
       title: {text: 'values'}
       },*/
      useHighStocks: true,
      size: {
        //width: 400,
        height: 400
      },
      //function (optional)
      func: chart => {
        this.$timeout(function() {
          chart.reflow();
        }, 0);
      }
    };
  }
}

angular.module('watchstocksApp')
  .controller('MainController', MainController);

})();
