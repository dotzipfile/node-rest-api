/*
 * Example TCP (Net) Client
 * 
 */

// Dependencies
var net = require('net');

// Define outbound message
var outboundMessage = 'ping';

// Create the client
var client = net.createConnection({ port: 6000 }, function() {
  // Send the message
  client.write(outboundMessage);
});

// Parse server response
client.on('data', function(inboundMessage) {
  var messageString = inboundMessage.toString();
  console.log("I wrote " + outboundMessage + " and they wrote " + messageString);
  client.end();
});


