/*
 * Request handlers
 * 
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');

// Handlers
var handlers = {};

/*
 * HTML Handlers
 *
 */

// Index Handler
handlers.index = function(data, callback) {
  // Reject any request that isn't a GET
  if(data.method == 'get') {
    // Read in a template as a string
    helpers.getTemplate('index', function(err, str) {
      if(!err && str) {
        callback(200, str, 'html');
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

/*
 * JSON API Handlers
 *
 */

// Users handler
handlers.users = function(data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Users submethods container
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback) {
  // Check that all required fields are filled out
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 12 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement === true ? true : false;

  if(firstName, lastName, phone, password, tosAgreement) {
    // Make sure user doesn't already exist
    _data.read('users', phone, function(err, data) {
      if(err) {
        // Hash the password
        var hashedPassword = helpers.hash(password);

        if(hashedPassword) {
          // Create user object
          var userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: true
          };

          // Store the user
          _data.create('users', phone, userObject, function(err) {
            if(!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Could not create new user' });
            }
          });
        } else {
          callback(500, { Error: 'Could not hash user\'s password' });
        }
      } else {
        // User already exists
        callback(400, {Error: 'A user with that phone number already exists'});
      }
    });
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
};

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = function(data, callback) {
  // Check phone number is valid
  var phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 12 ? data.queryStringObject.phone.trim() : false;

  if(phone) {
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Verify token is valid for phone number
    handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
      if(tokenIsValid) {
        // Lookup the user
        _data.read('users', phone, function(err, data) {
          if(!err && data) {
            // Remove hashed password from data before returning it
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, { Error: 'Missing required token in header, or token is invalid' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at lease one must be specified)
handlers._users.put = function(data, callback) {
  // Check required fields
  var phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 12 ? data.payload.phone.trim() : false;

  // Check optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if phone is invalid
  if(phone) {
    // Error if nothing is sent to be updated
    if(firstName || lastName || password) {
      // Get token from headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

      // Verify token is valid for phone number
      handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
        if(tokenIsValid) {
          // Lookup the user
          _data.read('users', phone, function(err, userData) {
            if(!err && userData) {
              // Update necessary fields
              if(firstName) {
                userData.firstName = firstName;
              }

              if(lastName) {
                userData.lastName = lastName;
              }

              if(password) {
                userData.hashedPassword = helpers.hash(password);
              }

              // Store updated data
              _data.update('users', phone, userData, function(err) {
                if(!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: 'Could not update user' });
                }
              });
            } else {
              callback(400, { Error: 'User does not exist' });
            }
          });   
        } else {
          callback(403, { Error: 'Missing required token in header, or token is invalid' });
        }
      });
    } else {
      callback(400, { Error: 'Missing fields to update' });
    }
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Users - delete
// Required field: phone
handlers._users.delete = function(data, callback) {
  // Validate phone number
  var phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 12 ? data.queryStringObject.phone.trim() : false;

  if(phone) {
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Verify token is valid for phone number
    handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
      if(tokenIsValid) {
        // Lookup the user
        _data.read('users', phone, function(err, userData) {
          if(!err && userData) {
            _data.delete('users', phone, function(err) {
              if(!err) {
                // Delete associated files
                var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                var checksToDelete = userChecks.length;

                if(checksToDelete > 0) {
                  var checksDeleted = 0;
                  var deletionErrors = false;

                  // Loop through checks
                  userChecks.forEach(function(checkId) {
                    _data.delete('checks', checkId, function(err) {
                      if(err) {
                        deletionErrors = true;
                      }

                      checksDeleted ++;
                      if(checksDeleted == checksToDelete) {
                        if(!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, { Error: 'Error encountered deleting user data files' });
                        }
                      }
                    });
                  });
                } else {
                  callback(200);
                }
              } else {
                callback(500, { Error: 'Could not delete user' });
              }
            });
          } else {
            callback(400, { Error: 'Could not find user' });
          }
        });
      } else {
        callback(403, { Error: 'Missing required token in header, or token is invalid' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Tokens handler
handlers.tokens = function(data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Tokens submethod container
handlers._tokens = {};
var tokenLength = 60;

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function(data, callback) {
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 12 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if(phone && password) {
    // Lookup user with phone number
    _data.read('users', phone, function(err, userData) {
      if(!err && userData) {
        // Hash password and compare to retrieved users password
        var hashedPassword = helpers.hash(password);
        if(hashedPassword == userData.hashedPassword) {
          // Create new token with random name. Expiration data: 1 hour in the future
          var tokenId = helpers.createRandomString(tokenLength);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires
          };

          // Store token
          _data.create('tokens', tokenId, tokenObject, function(err) {
            if(!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: 'Could not create new token' });
            }
          });
        } else {
          callback(400, { Error: 'Wrong password' });
        }
      } else {
        callback(400, { Error: 'Could not find user' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function(data, callback) {
  // Check id is valid
  var id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length == tokenLength ? data.queryStringObject.id.trim() : false;

  if(id) {
    // Lookup the token
    _data.read('tokens', id, function(err, tokenData) {
      if(!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function(data, callback) {
  // Check id is valid
  var id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length == tokenLength ? data.payload.id.trim() : false;
  var extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend == true ? true : false;

  if(id && extend) {
    // Lookup token
    _data.read('tokens', id, function(err, tokenData) {
      if(!err && tokenData) {
        // Check token is not expired
        if(tokenData.expires > Date.now()) {
          // Extend expiration by one hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          
          // Store new token info
          _data.update('tokens', id, tokenData, function(err) {
            if(!err) {
              callback(200);
            } else {
              callback(500, { Error: 'Could not update token expiration' });
            }
          });
        } else {
          callback(400, { Error: 'Token already expired' });
        }
      } else {
        callback(400, { Error: 'Token does not exist' });
      }
    });
  } else {
    callback(400, { Error: 'Missing or invalid required fields' });
  }
};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function(data, callback) {
  // Validate id
  var id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === tokenLength ? data.queryStringObject.id.trim() : false;

  if(id) {
    // Lookup the token
    _data.read('tokens', id, function(err, data) {
      if(!err && data) {
        _data.delete('tokens', id, function(err) {
          if(!err) {
            callback(200);
          } else {
            callback(500, { Error: 'Could not delete token' });
          }
        });
      } else {
        callback(400, { Error: 'Could not find token' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Verify if token is valid for user
handlers._tokens.verifyToken = function(id, phone, callback) {
  // Lookup token
  _data.read('tokens', id, function(err, tokenData) {
    if(!err && tokenData) {
      // Check token is for user and has not expired
      if(tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Checks handler
handlers.checks = function(data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Checks submethod container
handlers._checks = {};
var checkIdLength = 20;

// Checks - post
// Required data: protocol,url,method,successCodes,timeoutSeconds
// Optional data: none
handlers._checks.post = function(data, callback) {
  // Validate inputs
  var protocol = typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
  var method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
  var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
  var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

  if(protocol && url && method && successCodes && timeoutSeconds) {
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Lookup the user phone by reading the token
    _data.read('tokens', token, function(err, tokenData) {
      if(!err && tokenData){
        var userPhone = tokenData.phone;

        // Lookup the user data
        _data.read('users', userPhone, function(err, userData) { 
          if(!err && userData) {
            var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

            // Verify that user has less than the number of max-checks per user
            if(userChecks.length < config.maxChecks) {
              // Create random id for check
              var checkId = helpers.createRandomString(checkIdLength);

              // Create check object including userPhone
              var checkObject = {
                id: checkId,
                userPhone: userPhone,
                protocol: protocol,
                url: url,
                method: method,
                successCodes: successCodes,
                timeoutSeconds: timeoutSeconds
              };

              // Save the object
              _data.create('checks', checkId, checkObject, function(err) {
                if(!err) {
                  // Add check id to the user's object
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  // Save the new user data
                  _data.update('users', userPhone, userData, function(err) {
                    if(!err) {
                      // Return the data about the new check
                      callback(200,checkObject);
                    } else {
                      callback(500, { Error: 'Could not update the user with the new check.' });
                    }
                  });
                } else {
                  callback(500, { Error: 'Could not create the new check' });
                }
              });
            } else {
              callback(400, { Error: 'User check limit exceeded(' + config.maxChecks + ')' });
            }
          } else {
            callback(403);
          }
        });
      } else {
        callback(403);
      }
    });
  } else {
    callback(400, { Error: 'Missing required inputs, or inputs are invalid' });
  }
};

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = function(data,callback) {
  // Check that id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == checkIdLength ? data.queryStringObject.id.trim() : false;
  if(id) {
    // Lookup the check
    _data.read('checks', id, function(err, checkData) {
      if(!err && checkData) {
        // Get the token that sent the request
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valid and belongs to the user who created the check
        console.log("This is check data", checkData);
        handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
          if(tokenIsValid) {
            // Return check data
            callback(200,checkData);
          } else {
            callback(403);
          }
        });
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: 'Missing required field, or field invalid' });
  }
};

// Checks - put
// Required data: id
// Optional: protocol, url, method, successCodes, timeoutSeconds (at least one required)
handlers._checks.put = function(data, callback) {
  // Check for required field
  var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == checkIdLength ? data.payload.id.trim() : false;

  // Check for optional fields
  var protocol = typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
  var method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
  var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
  var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

  // Validate id
  if(id) {
    // Validate optional data
    if(protocol || url || method || successCodes || timeout) {
      // Lookup the check
      _data.read('checks', id, function(err, checkData) {
        if(!err && checkData) {
          // Get the token that sent the request
          var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

          // Verify that the given token is valid and belongs to the user who created the check
          handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
            if(tokenIsValid) {
              // Update check
              if(protocol) {
                checkData.protocol = protocol;
              }

              if(url) {
                checkData.url = url;
              }

              if(method) {
                checkData.method = method;
              }

              if(successCodes) {
                checkData.successCodes = successCodes;
              }

              if(timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds;
              }

              // Store updates
              _data.update('checks', id, checkData, function(err) {
                if(!err) {
                  callback(200);
                } else {
                  callback(500, { Error: 'Could not update check' });
                }
              });
            } else {
              callback(403);
            }
          });
        } else {
          callback(400, { Error: 'Check ID does not exist' });
        }
      });
    } else {
      callback(400, { Error: 'Invalid optional fields' });
    }
  } else {
    callback(400, { Error: 'Invalid required field' });
  }
};

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = function(data, callback) {
  // Validate phone number
  var id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length == checkIdLength ? data.queryStringObject.id.trim() : false;

  if(id) {
    // Lookup check
    _data.read('checks', id, function(err, checkData) {
      if(!err && checkData) {
        // Get token from headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify token is valid for phone number
        handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
          if(tokenIsValid) {
            // Delete check data
            _data.delete('checks', id, function(err) {
              if(!err) {
                // Lookup user
                _data.read('users', checkData.userPhone, function(err, userData) {
                  if(!err && userData) {
                    var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                    // Remove deleted check from list
                    var checkPosition = userChecks.indexOf(id);
                    if(checkPosition > -1) {
                      userChecks.splice(checkPosition, 1);

                      // Re-save user data
                      _data.update('users', checkData.userPhone, userData, function(err) {
                        if(!err) {
                          callback(200);
                        } else {
                          callback(500, { Error: 'Could not update user' });
                        }
                      });
                    } else {
                      callback(500, { Error: 'Could not find check' });
                    }

                  } else {
                    callback(400, { Error: 'User not found' });
                  }
                });
              } else {
                callback(500, { Error: 'Could not delete data' });
              }
            });
          } else {
            callback(403);
          }
        });
      } else {
        callback(400, { Error: 'Check ID does not exist' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Ping handler
handlers.ping = function(data, callback) {
  callback(200);
};

// 404 handler
handlers.notFound = function(data, callback) {
  callback(404);
};

// Export the module
module.exports = handlers;
