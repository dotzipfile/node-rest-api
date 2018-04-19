/*
 * Example REPL Server
 * 
 */

// Dependencies
var repl = require('repl');

// Start REPL
repl.start({
  prompt: '>',
  eval: function(str) {
    // Evaluation function
    console.log("Evaluation stage, received: ", str);

    // Reply with 'buzz' if user says 'fizz'
    if(str.indexOf('fizz') > -1) {
      console.log('buzz');
    } 
  }
});
