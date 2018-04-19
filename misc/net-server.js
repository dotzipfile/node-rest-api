/*
 * Example TCP (Net) Server
 * 
 */

// Dependencies
var net = require('net');

// Create the server
var server = net.createServer(function(connection) {
  // Send the word "pong"
  var outboundMessage = 'pong';
  connection.write(outboundMessage);

  // When data is received from the client, print it
  connection.on('data', function(inboundMessage) {
    var messageString = inboundMessage.toString();
    console.log("I wrote " + outboundMessage + " and they wrote " + messageString);
  });
});

// Bind to port
server.listen(6000);
