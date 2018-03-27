/*
 * Helpers for various tasks
 * 
 */

// Dependencies
var crypto = require('crypto');
var config = require('./config');
var https = require('https');
var querystring = require('querystring');

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
    var possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789!';

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

// Send SMS via Twilio
helpers.sendTwilioSms = function(phone, msg, callback) {
  // Validate input
  phone = typeof(phone) == 'string' && phone.trim().length == 12 ? phone.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

  if(phone && msg) {
    // Configure request payload
    var payload = {
      From: config.twilio.fromPhone,
      To: '+' + phone,
      Body: msg
    };

    var stringPayload = querystring.stringify(payload);

    // Configure request details
    var requestDetails = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      auth: config.twilio.accountSid + ':' + config.twilio.authToken,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate request object
    var req = https.request(requestDetails, function(res) {
      // Get request status
      var status = res.statusCode;

      if(status == 200 || status == 201) {
        callback(false);
      } else {
        callback('Status code: ' + status);
      }
    });

    // Bind to error event
    req.on('error', function(e) {
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();
  } else {
    callback('Invalid input');
  }
};

// Export the module
module.exports = helpers;
