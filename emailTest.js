if (typeof(module) !== 'undefined') {
	var rhs = require('./rhs.js').rhs;
	var automata = require('./automata.js').automata;
}

/* "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?" */

var alphabetDigit = "a-zA-Z0-9"
var alphabetDigitscore = rhs.group(alphabetDigit, '-')
var symbols = "!#$%&'*+/=?^_`{|}~-";
var allowedChars = rhs.group(alphabetDigit, symbols).repeat(1, Infinity);
var dot = "(?:\\.)"
var dotCharRepeat = rhs.concat(dot, allowedChars).repeat(0, Infinity);
var local = rhs.concat(allowedChars, dotCharRepeat)

alphabetDigit = rhs.group(alphabetDigit)
var alphaDigRepeat = rhs.concat("(?:)", alphabetDigitscore.repeat(0, Infinity), alphabetDigit).repeat(0,1);
var domain = rhs.concat("(?:)", alphabetDigit, alphaDigRepeat.concat("\\.")).repeat(1, Infinity).concat(alphabetDigit).concat(alphaDigRepeat);
var email = local.concat('@', domain)
//can also write var email = rhs.concat(local, '@', domain);
console.log(email.toString())

console.log(email.match("radhika.marvin@yahoo.com"));
console.log(email.test("radhika.marvin@yahoo.com"));

