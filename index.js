/*
 * Main API file
 *
 */

// Dependencies
const http = require('http');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;

// Config variables
const port = 3000;

const server = http.createServer(function(req, res) {

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
});

server.listen(port, function() {
  console.log("Listening on port 3000...");
});

// Handlers
var handlers = {};

handlers.sample = function(data, callback) {
  callback(406, {'name': 'sample handler'});
};

handlers.notFound = function(data, callback) {
  callback(404);
};

// Request router
var router = {
  'sample': handlers.sample
};
