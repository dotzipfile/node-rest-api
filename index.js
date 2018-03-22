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
    
    // Send a response
    res.end("Hello world!\n");

    // Log path
    console.log("Request payload: ", buffer);
  
  });
});

server.listen(port, function() {
  console.log("Listening on port 3000...");
});