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
var util = require('util');
var debug = util.debuglog('server');

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
    chosenHandler(data, function(statusCode, payload, contentType) {
      // Determine response type
      contentType = typeof(contentType) == 'string' ? contentType : 'json';

      // Set returned or default status code
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Return the response parts that are content-type specific
      var payloadString = '';
      if(contentType == 'json') {
        res.setHeader('Content-Type', 'application/json');
        payload = typeof(payload) == 'object' ? payload : {};
        payloadString = JSON.stringify(payload);
      }

      if(contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof(payload) == 'string' ? payload : '';
      }

      // Return the response-parts common to all content-types
      res.writeHead(statusCode);
      res.end(payloadString);

      // If the response is 200, print green, otherwise print red
      if(statusCode == 200){
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      } else {
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      }
    });
  });
};

// Request router
server.router = {
  '': handlers.index,
  'account/create': handlers.accountCreate,
  'account/edit': handlers.accountEdit,
  'account/deleted': handlers.accountDeleted,
  'session/create': handlers.sessionCreate,
  'session/deleted': handlers.sessionDeleted,
  'checks/all': handlers.checksList,
  'checks/create': handlers.checksCreate,
  'checks/edit': handlers.checksEdit,
  'ping': handlers.ping,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/checks': handlers.checks
};

// Server initialisation
server.init = function() {
  // Start http server
  server.httpServer.listen(config.httpPort, function() {
    console.log('\x1b[36m%s\x1b[0m', "Listening on port " + config.httpPort);
  });

  // Start https server
  server.httpsServer.listen(config.httpsPort, function() {
    console.log('\x1b[35m%s\x1b[0m', "Listening on port " + config.httpsPort);
  });
};

// Export server module
module.exports = server;
