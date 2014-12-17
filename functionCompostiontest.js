if (typeof(module) !== 'undefined') {
    var rhs = require('./rhs.js').rhs;
    var automata = require('./automata.js').automata;
}


var curry = rhs.compose(rhs.pivot)(rhs.alter)(rhs.concat)(rhs.single)(rhs.repeat)();
var full = curry("Super cool", " Bodik ", ["Sara", "Ali", "Shaon"], [" Thank you for such a great semester!"], [], [0, Infinity]);
console.log(full.toString())
console.log()

var curried = curry("Super cool", " Bodik ", ["Sara", "Ali", "Shaon"]);
var curry1 = curried([" Friendship is magic"], [], [1, Infinity]);
var curry2 = curried([" are really awesome people"], [], [10000]);

console.log(curry1.toString())
console.log()
console.log(curry2.toString())


var re = new rhs("start");
var func1 = re.compose(rhs.alter)(rhs.repeat)();
var func2 = re.compose(func1)(rhs.alter)(rhs.repeat)(rhs.concat)();
console.log('\n',func2(["friend group", [4, 8]], "[^Soham]", 10000, " Dear Bodik, please be merciful on our grades").toString());
// ((((start)|(friend group)){4,8})|([^Soham])){10000} Dear Bodik, please be merciful on our grades

