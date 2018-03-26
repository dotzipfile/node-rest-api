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

// Create random string of a given length
helpers.createRandomString = function(strLength) {
  strLenth = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength) {
    // Define all possible characters that could be in string
    var possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789!£$%^&*?#';

    // Initialise final string
    var str = '';
    for(var i = 1; i <= strLength; i ++) {
      // Get random character from possible characters
      var randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
      // Append character to final string
      str += randomChar;
    }

    // Return final string
    return str;
  } else {
    return false;
  }
};

// Export the module
module.exports = helpers;
