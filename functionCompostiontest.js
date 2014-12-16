if (typeof(module) !== 'undefined') {
    var rhs = require('./rhs.js').rhs;
    var automata = require('./automata.js').automata;
}

var curry = rhs.compose(rhs.pivot)(rhs.alter)(rhs.alter)(rhs.alter)(rhs.single)(rhs.alter)();
var full = curry("We are ","friends forever ", ["HongJun"], ["Radhika"], ["Soham"], [], ["Partners for the win"]);
console.log(full.toString())
console.log()
// returns RE: /(Friend Soham Friend HongJun)|(Radhika)(Sara){1}/
console.log("<---------->")
var curried = curry("Friend ", ["Soham "]);
console.log(curried(["HongJun"], ["Radhika"], ["Sara"], [], ["peace out"]).toString());
console.log()
console.log(curried(["Bodik"], ["Sara"], ["Weee"], [], ["Friendship is magic"]).toString());
console.log()


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
console.log()




