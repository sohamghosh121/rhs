if (typeof(module) !== 'undefined') {
	var rhs = require('./rhs.js').rhs;
	var automata = require('./automata.js').automata;
}


/* "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?" */

var allowedChars = "a-zA-Z0-9"
var symbols = "!#$%&'*+/=?^_`{|}~-";
var allowedChars = rhs.group(allowedChars, symbols).repeat(1, Infinity);

var dot = "?:/."
new rhs(dot)
var dotCharRepeat = rhs.concat(dot, allowedChars).repeat(0, Infinity);
email = rhs.concat(allowedChars, local)

//var first = rhs.concat(rhs.alphabet, rhs.digit, special).repeat(1, infinity)
//var local = rhs.concat(rhs.alphabet, rhs.digits, special,
console.log(local)
