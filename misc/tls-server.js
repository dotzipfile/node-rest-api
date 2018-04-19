/*
 * Example TLS Server
 * 
 */

// Dependencies
var tls = require('tls');
var fs = require('fs');
var path = require('path');

// Server options
var options = {
  key: fs.readFileSync(path.join(__dirname, './../https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, './../https/cert.pem'))
};

// Create the server
var server = tls.createServer(options, function(connection) {
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
