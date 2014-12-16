if (typeof(module) !== 'undefined') {
	var rhs = require('./rhs.js').rhs;
	var automata = require('./automata.js').automata;
}

console.log("A u B");
a = new rhs("(abc)")
b = new rhs("(def)")
console.log(rhs.union(a, b).toString());
console.log("------------\n");

console.log("A u B u A");
console.log(rhs.union(a, b, a).toString());
console.log("------------\n");

console.log("A n B");
a = new rhs("[a-e]*fg");
b = new rhs("[c-f]+fg");
console.log(rhs.intersect(a, b).toString());
console.log("------------\n");

console.log("A n B'");
a = new rhs("a")
b = new rhs("[d-f]")
//console.log(rhs.intersect(a, rhs.complement(b)).toString());
console.log("------------\n");

console.log("B\'\'")
b = new rhs("[b-d]")
//console.log(rhs.complement(rhs.complement(b)).toString())
console.log(automata.complement(automata.complement(automata.fromRE("[b-z]"))).toRE());
console.log("------------\n");