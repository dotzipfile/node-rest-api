/*
 * CLI related tasks
 * 
 */

// Dependencies
var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');
var events = require('events');
class _events extends events{};
var e = new _events();
var os = require('os');
var v8 = require('v8');
var _data = require('./data');

// Instantiate CLI module object
var cli = {};

// Input handlers
e.on('man', function(str) {
  cli.responders.help();
});

e.on('help', function(str) {
  cli.responders.help();
});

e.on('exit', function(str) {
  cli.responders.exit();
});

e.on('stats', function(str) {
  cli.responders.stats();
});

e.on('list users', function(str) {
  cli.responders.listUsers();
});

e.on('more user info', function(str) {
  cli.responders.moreUserInfo(str);
});

e.on('list checks', function(str) {
  cli.responders.listChecks(str);
});

e.on('more check info', function(str) {
  cli.responders.moreCheckInfo(str);
});

e.on('list logs', function(str) {
  cli.responders.listLogs();
});

e.on('more log info', function(str) {
  cli.responders.moreLogInfo(str);
});

// Responders object
cli.responders = {};

// Help/Man
cli.responders.help = function() {
  // Define commands and their descriptions
  var commands = {
    'exit': 'Kill the CLI (and the rest of the application)',
    'man': 'Show this help page',
    'help': 'Alias of the "man" command',
    'stats': 'Get statistic on the underlying operating system and resource utilisation',
    'list users': 'Show a list of all the registered users in the system',
    'more user info --{userId}': 'Show specifig user information',
    'list checks --up --down': 'List all active checks in the system, "--up" and "--down" flags are optional',
    'more check info --{checkId}': 'Show details of a specified check',
    'list logs': 'Show a list of all log files available to be read',
    'more log info --{fileName}': 'Show details of a specified log file'
  };

  // Show header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered('CLI MANUAL');
  cli.horizontalLine();
  cli.verticalSpace(2);
  
  // Show each command followed by it's description
  for(var key in commands) {
    if(commands.hasOwnProperty(key)) {
      // Get key and add colour and padding
      var value = commands[key];
      var line = '\x1b[33m' + key + '\x1b[0m';
      var padding = 60 - line.length;

      for(var i = 0; i < padding; i ++) {
        line += ' ';
      }

      line += value;

      // Print out the line
      console.log(line);
      cli.verticalSpace();
    }
  }

  cli.verticalSpace(1);

  // End with another horizontal line
  cli.horizontalLine();
};

// Create a vertical space
cli.verticalSpace = function(lines) {
  lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
  for(var i = 0; i < lines; i ++) {
    console.log('');
  }
};

// Create horizontal line across the screen
cli.horizontalLine = function() {
  // Get available screen size
  var width = process.stdout.columns;

  var line = '';
  for(var i = 0; i < width; i ++) {
    line += '-';
  }

  console.log(line);
};

// Create centered text on the screen
cli.centered = function(str) {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';

  // Get the available screen size
  var width = process.stdout.columns;

  // Calculate the left padding there should be
  var leftPadding = Math.floor((width - str.length) / 2);

  // Put in left padded spaces before the string itself
  var line = '';
  for(var i = 0; i < leftPadding; i ++) {
    line += ' ';
  }

  line+= str;
  console.log(line);
};

// Exit
cli.responders.exit = function() {
  process.exit(0);
};

// Stats
cli.responders.stats = function() {
  // Compile and object of stats
  var stats = {
    'Load Average': os.loadavg().join(' '),
    'CPU Count': os.cpus().length,
    'Free Memory': os.freemem(),
    'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
    'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
    'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100) + '%',
    'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100) + '%',
    'Uptime': os.uptime() + ' Seconds'
  };

  // Show header for stats page
  cli.horizontalLine();
  cli.centered('SYSTEM STATISTICS');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Log out each stat
  for(var key in stats) {
    if(stats.hasOwnProperty(key)) {
      // Get key and add colour and padding
      var value = stats[key];
      var line = '\x1b[33m' + key + '\x1b[0m';
      var padding = 60 - line.length;

      for(var i = 0; i < padding; i ++) {
        line += ' ';
      }

      line += value;

      // Print out the line
      console.log(line);
      cli.verticalSpace();
    }
  }

  cli.verticalSpace(1);

  // End with another horizontal line
  cli.horizontalLine();
};

// List Users
cli.responders.listUsers = function() {
  _data.list('users', function(err, userIds) {
    if(!err && userIds && userIds.length > 0) {
      cli.verticalSpace(1);
      userIds.forEach(function(userId) {
        _data.read('users', userId, function(err, userData) {
          if(!err && userData) {
            var line = 'Name: ' + userData.firstName + ' ' + userData.lastName + ', Phone: ' + userData.phone + ', Checks: ';
            var numberOfChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;
            line += numberOfChecks;
            console.log(line);
            cli.verticalSpace(1);
          }
        });
      });
    }
  });
};

// More user info
cli.responders.moreUserInfo = function(str) {
  // Get id from provided string
  var arr = str.split('--');
  var userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

  if(userId) {
    // Lookup the user
    _data.read('users', userId, function(err, userData) {
      if(!err && userData) {
        // Remove the hashed password
        delete userData.hashedPassword;

        // Print JSON object of the user with text highlighted
        cli.verticalSpace(1);
        console.dir(userData, { 'colors': true });
        cli.verticalSpace(1);
      }
    });
  }
};

// List checks
cli.responders.listChecks = function(str) {
  console.log("You asked for list checks", str);
};

// More check info
cli.responders.moreCheckInfo = function(str) {
  console.log("You asked for moreCheckInfo", str);
};

// List logs
cli.responders.listLogs = function() {
  console.log("You asked for list logs");
};

// More log info
cli.responders.moreLogInfo = function(str) {
  console.log("You asked for more log info", str);
};

// Input processor
cli.processInput = function(str) {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;

  // Only process the input if the user actually wrote something. Otherwise ignore it
  if(str) {
    // Codify the unique strings that identify the unique questions allowed to be asked
    var uniqueInputs = [
      'man',
      'help',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list checks',
      'more check info',
      'list logs',
      'more log info'
    ];

    // Go through the possible inputs, emit event when a match is found
    var matchFound = false;
    var counter = 0;

    uniqueInputs.some(function(input) {
      if(str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // Emit an event matching the unique input, and include the full string by the user
        e.emit(input, str);
        return true;
      }
    });

    // Tell user to try again if a match is not found
    if(!matchFound) {
      console.log("Unrecognised command: " + str.trim() + ". Try again.");
    }
  }
};

// Init script
cli.init = function() {
  // Send the start message to the console, in dark blue
  console.log('\x1b[34m%s\x1b[0m', "CLI is running ");

  // Start the interface
  var _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>'
  });

  // Create initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on('line', function(str) {
    // Send to the input processor
    cli.processInput(str);

    // Re-initialise the prompt again
    setTimeout(function() {
      _interface.prompt('>');
    }, 50);
  })

  // If the user stops the CLI, kill the associated process
  _interface.on('close', function() {
    process.exit(0);
  });
};

module.exports = cli;
