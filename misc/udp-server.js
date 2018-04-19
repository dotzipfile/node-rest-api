/*
 * Example UDP Server
 * 
 */

// Dependencies
var dgram = require('dgram');

// Create server
var server = dgram.createSocket('udp4');

server.on('message', function(messageBuffer, sender) {
  // Process incoming connection
  var messageString = messageBuffer.toString();
  console.log(messageString);
});

// Bind to 6000
server.bind(6000);
