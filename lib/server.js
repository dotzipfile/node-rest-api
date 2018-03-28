/*
 * Server setup
 *
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');

// Server object
var server = {};

// Instantiate http server
server.httpServer = http.createServer(function(req, res) {
  server.unifiedServer(req, res);
});

// Instantiate https server
server.httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};

server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res) {
  server.unifiedServer(req, res);
});

// Server logic for http and https
server.unifiedServer = function(req, res) {
  // Get URL, trimmed path, query string, HTTP method and headers
  var parsedUrl = url.parse(req.url, true);
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');
  var queryStringObject = parsedUrl.query;
  var method = req.method.toLowerCase();
  var headers = req.headers;

  // Get payload
  var decoder = new stringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data){
    buffer += decoder.write(data);
  });

  req.on('end', function() {
    buffer += decoder.end();

    // Choose handler
    var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // Construct data
    var data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer)
    };
    
    // Route request to correct handler
    chosenHandler(data, function(statusCode, payload) {
      // Set returned or default status code
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Set returned or default payload
      payload = typeof(payload) == 'object' ? payload : {};

      var payloadString = JSON.stringify(payload);

      // Send response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log information
      console.log("Returning response: ", statusCode, payloadString);
    });
  });
};

// Request router
server.router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks
};

// Server initialisation
server.init = function() {
  // Start http server
  server.httpServer.listen(config.httpPort, function() {
    console.log("Listening on port " + config.httpPort);
  });

  // Start https server
  server.httpsServer.listen(config.httpsPort, function() {
    console.log("Listening on port " + config.httpsPort);
  });
};

// Export server module
module.exports = server;
