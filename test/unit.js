/*
 * Unit Tests
 * 
 */

// Dependencies
var helpers = require('./../lib/helpers');
var assert = require('assert');
var logs = require('./../lib/logs');

// Holder for tests
var unit = {};

// Assert that the getANumber is returning a number
unit['helplers.getANumber should return a number'] = function(done) {
  var val = helpers.getANumber();
  assert.equal(typeof(val), 'number');
  done();
};

// Assert that the getANumber is returning a 1
unit['helplers.getANumber should return 1'] = function(done) {
  var val = helpers.getANumber();
  assert.equal(val, 1);
  done();
};

// Assert that the getANumber is returning a 2
unit['helplers.getANumber should return 2'] = function(done) {
  var val = helpers.getANumber();
  assert.equal(val, 2);
  done();
};

// Logs.list should callback an array and a false error
unit['Logs.list should callback a false error and an array of log names'] = function(done) {
  logs.list(true, function(err, logFileNames) {
    assert.equal(err, false);
    assert.ok(logFileNames instanceof Array);
    assert.ok(logFileNames.length > 1);
    done();
  });
};

// Logs.truncate should not throw if logId doesn't exist
unit['Logs.truncate should not throw if logId doesnt exist, should callback and error'] = function(done) {
  assert.doesNotThrow(function() {
    logs.truncate('I do not exist', function(err) {
      assert.ok(err);
      done();
    });
  }, TypeError);
};

module.exports = unit;
