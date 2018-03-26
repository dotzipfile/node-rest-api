/*
 * Create and export configuration vars
 * 
 */

// Container for environments
var environments = {};

// Staging (default) environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging'
}

// Production environment
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production'
};

// Determine which environment was passed as an argument at launch
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Select environment if one was specified, or else select staging as default
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;