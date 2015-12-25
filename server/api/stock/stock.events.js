/**
 * Stock model events
 */

'use strict';

import {EventEmitter} from 'events';
var Stock = require('./stock.model');
var StockEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
StockEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Stock.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    StockEvents.emit(event + ':' + doc._id, doc);
    StockEvents.emit(event, doc);
  }
}

export default StockEvents;
