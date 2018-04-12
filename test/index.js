/*
 * Test runner
 * 
 */

// Dependencies
var helpers = require('./../lib/helpers');
var assert = require('assert');

// Application log for the test runner
_app = {};

// Container for the tests
_app.tests = {
  unit: {}
};

// Assert that the getANumber is returning a number
_app.tests.unit['helplers.getANumber should return a number'] = function(done) {
  var val = helpers.getANumber();
  assert.equal(typeof(val), 'number');
  done();
};

// Assert that the getANumber is returning a 1
_app.tests.unit['helplers.getANumber should return 1'] = function(done) {
  var val = helpers.getANumber();
  assert.equal(val, 1);
  done();
};

// Assert that the getANumber is returning a 2
_app.tests.unit['helplers.getANumber should return 2'] = function(done) {
  var val = helpers.getANumber();
  assert.equal(val, 2);
  done();
};

// Count all the tests
_app.countTests = function() {
  var counter = 0;
  for(var key in _app.tests) {
    if(_app.tests.hasOwnProperty(key)) {
      var subTests = _app.tests[key];
      for(var testName in subTests) {
        if(subTests.hasOwnProperty(testName)) {
          counter ++;
        }
      }
    }
  }

  return counter;
};

// Run all the tests, collecting the errors and success
_app.runTests = function() {
  var errors = [];
  var successes = 0;
  var limit = _app.countTests();
  var counter = 0;

  for(var key in _app.tests) {
    if(_app.tests.hasOwnProperty(key)) {
      var subTests = _app.tests[key];
      for(var testName in subTests) {
        if(subTests.hasOwnProperty(testName)) {
          (function() {
            var tmpTestName = testName;
            var testValue = subTests[testName];

            // Call the test
            try {
              testValue(function() {
                // If it calls back without throwing, then it succeeded, so log it in green
                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                counter ++;
                successes ++;
                if(counter == limit) {
                  _app.produceTestReport(limit, successes, errors);
                }
              });
            } catch(e) {
              // If it throws then it failed, capture error and log it in red
              errors.push({
                name: testName,
                error: e
              });

              console.log('\x1b[31m%s\x1b[0m', tmpTestName);
              counter ++;

              if(counter == limit) {
                _app.produceTestReport(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
};

// Produce test outcome report
_app.produceTestReport = function(limit, successes, errors) {
  console.log("");
  console.log("-----------BEGIN TEST REPORT-----------");
  console.log("");
  console.log("Total Tests: ", limit);
  console.log("Pass: ", successes);
  console.log("Fail: ", errors.length);
  console.log("");

  // If there are errors, print them in detail
  if(errors.length > 0) {
    console.log("-----------BEGIN ERROR DETAILS-----------");
    console.log("");
    
    errors.forEach(function(testError) {
      console.log('\x1b[31m%s\x1b[0m', testError.name);
      console.log(testError.error);
      console.log("");
    });

    console.log("");
    console.log("-----------END ERROR DETAILS-----------");
  }

  console.log("");
  console.log("-----------END TEST REPORT-----------");
};

// Run the tests
_app.runTests();
