'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var stockCtrlStub = {
  index: 'stockCtrl.index',
  show: 'stockCtrl.show',
  create: 'stockCtrl.create',
  update: 'stockCtrl.update',
  destroy: 'stockCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var stockIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './stock.controller': stockCtrlStub
});

describe('Stock API Router:', function() {

  it('should return an express router instance', function() {
    stockIndex.should.equal(routerStub);
  });

  describe('GET /api/stocks', function() {

    it('should route to stock.controller.index', function() {
      routerStub.get
        .withArgs('/', 'stockCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/stocks/:id', function() {

    it('should route to stock.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'stockCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/stocks', function() {

    it('should route to stock.controller.create', function() {
      routerStub.post
        .withArgs('/', 'stockCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/stocks/:id', function() {

    it('should route to stock.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'stockCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/stocks/:id', function() {

    it('should route to stock.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'stockCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/stocks/:id', function() {

    it('should route to stock.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'stockCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
