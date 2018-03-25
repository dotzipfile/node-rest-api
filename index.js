/*
 * Main API file
 *
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instantiate http server
var httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});

// Start http server
httpServer.listen(config.httpPort, function() {
  console.log("Listening on port " + config.httpPort);
});

// Instantiate https server
var httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
});

// Start https server
httpsServer.listen(config.httpsPort, function() {
  console.log("Listening on port " + config.httpsPort);
});

// Server logic for http and https
var unifiedServer = function(req, res) {
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
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct data
    var data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      header: headers,
      payload: buffer
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

// Handlers
var handlers = {};

// Ping handler
handlers.ping = function(data, callback) {
  callback(200);
};

// 404 handler
handlers.notFound = function(data, callback) {
  callback(404);
};

// Request router
var router = {
  ping: handlers.ping
};
