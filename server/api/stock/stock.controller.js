/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/stocks              ->  index
 * POST    /api/stocks              ->  create
 * GET     /api/stocks/:id          ->  show
 * PUT     /api/stocks/:id          ->  update
 * DELETE  /api/stocks/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
var Stock = require('./stock.model');
var https = require('https');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Stocks
export function index(req, res) {
  Stock.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
}

function getStockData(name) {
  return new Promise((resolve, reject) => {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();

    https.get(`https://www.quandl.com/api/v3/datasets/WIKI/${name}.json?api_key=${process.env.QUANDL_API_KEY}&start_date=${year - 1}-${month}-${date}&end_date=${year}-${month}-${date}`, res => {
      var data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });


      res.on('end', function () {
        data = JSON.parse(data);

        if (!data || data.quandl_error) {
          reject(data);
        } else {
          resolve(data);
        }

      });

      res.resume();
    }).on('error', e => {
      reject(Error(e.message));
    })
  });
}

// Gets a single Stock from the DB
export function show(req, res) {
  getStockData(req.params.id)
    .then(responseWithResult(res))
    .catch(handleError(res, 400));


  //Stock.findByIdAsync(req.params.id)
  //  .then(handleEntityNotFound(res))
  //  .then(responseWithResult(res))
  //  .catch(handleError(res));
}

// Creates a new Stock in the DB
export function create(req, res) {

  if (!req.body.name) {
    res.status(400).end();
    return;
  }

  https.get(`https://www.quandl.com/api/v3/datasets/WIKI/${req.body.name.toUpperCase()}/metadata.json`, (resp) => {
    var data = '';

    resp.on('data', (chunk) => {
      data += chunk
    });

    resp.on('end', () => {
      data = JSON.parse(data);

      res
        .status(resp.statusCode)
        .end();

      if (parseInt(resp.statusCode / 100) === 2) {
        Stock.findAsync({code: data.dataset.dataset_code})
          .then((stock) => {
            if (stock.length) {
              return;
            }

            Stock.createAsync({
              name: data.dataset.name,
              code: data.dataset.dataset_code
            });
          });
      }
    });
  }).on('error', (err) => {
    res
      .status(400)
      .json(err)
      .end();
  });
}

// Updates an existing Stock in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Stock.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Deletes a Stock from the DB
export function destroy(req, res) {
  Stock.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
