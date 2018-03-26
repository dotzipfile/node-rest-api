/*
 * Helpers for various tasks
 * 
 */

// Dependencies
var crypto = require('crypto');
var config = require('./config');

// Container for helpers
var helpers = {};

// Hash helper (SHA256 hash)
helpers.hash = function(str) {
  if(typeof(str) === 'string' && str.length > 0) {
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse JSON string to object in all cases
helpers.parseJsonToObject = function(str) {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch(e) {
    return {};
  }
};

// Export the module
module.exports = helpers;