'use strict';

var app = require('../..');
import request from 'supertest';

var newStock;

describe('Stock API:', function() {

  describe('GET /api/stocks', function() {
    var stocks;

    beforeEach(function(done) {
      request(app)
        .get('/api/stocks')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          stocks = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      stocks.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/stocks', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/stocks')
        .send({
          name: 'New Stock',
          info: 'This is the brand new stock!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newStock = res.body;
          done();
        });
    });

    it('should respond with the newly created stock', function() {
      newStock.name.should.equal('New Stock');
      newStock.info.should.equal('This is the brand new stock!!!');
    });

  });

  describe('GET /api/stocks/:id', function() {
    var stock;

    beforeEach(function(done) {
      request(app)
        .get('/api/stocks/' + newStock._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          stock = res.body;
          done();
        });
    });

    afterEach(function() {
      stock = {};
    });

    it('should respond with the requested stock', function() {
      stock.name.should.equal('New Stock');
      stock.info.should.equal('This is the brand new stock!!!');
    });

  });

  describe('PUT /api/stocks/:id', function() {
    var updatedStock;

    beforeEach(function(done) {
      request(app)
        .put('/api/stocks/' + newStock._id)
        .send({
          name: 'Updated Stock',
          info: 'This is the updated stock!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedStock = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedStock = {};
    });

    it('should respond with the updated stock', function() {
      updatedStock.name.should.equal('Updated Stock');
      updatedStock.info.should.equal('This is the updated stock!!!');
    });

  });

  describe('DELETE /api/stocks/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/stocks/' + newStock._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when stock does not exist', function(done) {
      request(app)
        .delete('/api/stocks/' + newStock._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
