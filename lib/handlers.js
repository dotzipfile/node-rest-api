/*
 * Request handlers
 * 
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

// Handlers
var handlers = {};

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
// @TODO Only let authenticated users access their own data
handlers._users.get = function(data, callback) {
  // Check phone number is valid
  var phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 12 ? data.queryStringObject.phone.trim() : false;

  if(phone) {
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
    callback(400, { Error: 'Missing required field' });
  }
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at lease one must be specified)
// @TODO Only let authenticated user update their own object
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
      callback(400, { Error: 'Missing fields to update' });
    }
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Users - delete
// Required field: phone
// @TODO Only let an authenticated user delete their own object
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = function(data, callback) {
  // Validate phone number
  var phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 12 ? data.queryStringObject.phone.trim() : false;

  if(phone) {
    // Lookup the user
    _data.read('users', phone, function(err, data) {
      if(!err && data) {
        _data.delete('users', phone, function(err) {
          if(!err) {
            callback(200);
          } else {
            callback(500, { Error: 'Could not delete user' });
          }
        });
      } else {
        callback(400, { Error: 'Could not find user' });
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
