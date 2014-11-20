if (typeof(module) !== 'undefined') {
	var rhs = require('./rhs.js').rhs;
}

var re1 = new rhs("ab")
			.concat("c")
			.alter("d")
			.repeat(2,8);

var re2 = rhs.group("a", "b", rhs.range(0, 6))
var re3 = re1.alter(re2)

console.log(re1)
console.log(re2)
console.log(re3)