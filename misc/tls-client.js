/*
 * Example TLS Client
 * 
 */

// Dependencies
var tls = require('tls');
var fs = require('fs');
var path = require('path');

// Server options
var options = {
  ca: fs.readFileSync(path.join(__dirname, './../https/cert.pem')) // Only required with self signed cert
};

// Define outbound message
var outboundMessage = 'ping';

// Create the client
var client = tls.connect(6000, options, function() {
  // Send the message
  client.write(outboundMessage);
});

// Parse server response
client.on('data', function(inboundMessage) {
  var messageString = inboundMessage.toString();
  console.log("I wrote " + outboundMessage + " and they wrote " + messageString);
  client.end();
});
