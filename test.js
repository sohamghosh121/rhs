if (typeof(module) !== 'undefined') {
	var rhs = require('./rhs.js').rhs;
	var automata = require('./automata.js').automata;
}

console.log(automata.fromRE("ab"));