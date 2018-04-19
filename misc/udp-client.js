/*
 * Example UDP Client
 * 
 */

// Dependencies
var dgram = require('dgram');

// Create client
var client = dgram.createSocket('udp4');

// Define message and put it into a buffer
var messageString = 'This is a message';
var messageBuffer = Buffer.from(messageString);

// Send message
client.send(messageBuffer, 6000, 'localhost', function(err) {
  client.close();
});
