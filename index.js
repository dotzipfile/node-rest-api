/*
 * Main API file
 *
 */

// Dependencies
const http = require('http');
const url = require('url');

// Config variables
const port = 3000;

const server = http.createServer(function(req, res) {

  // Parse incoming URL using "query string"
  var parsedUrl = url.parse(req.url, true);

  // Get untrimmed path and trim it
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Send a response
  res.end("Hello world!\n");

  // Log path
  console.log("Request received on path: " + trimmedPath);

});

server.listen(port, function() {
  console.log("Listening on port 3000...");
});