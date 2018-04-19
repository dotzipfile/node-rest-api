/*
 * Example HTTP2 Client
 * 
 */

var http2 = require('http2');

// Create client
var client = http2.connect('http://localhost:6000');

// Create request
var req = client.request({
  ':path': '/'
});

// When a message is received, combine pieces of request
var str = '';
req.on('data', function(chunk) {
  str += chunk;
});

// When the message ends, log it out
req.on('end', function() {
  console.log(str);
});

// End the request
req.end();
