if (typeof(module) !== 'undefined') {
	var rhs = require('./rhs.js').rhs;
	var automata = require('./automata.js').automata;
}

var re = new rhs("start");
var func0 = re.compose(rhs.alter)(rhs.alter)(rhs.repeat)();
console.log('\n', func0("abc", "def", [4,8]).toString());
var nested = rhs.compose(func0)(rhs.concat)(rhs.repeat)(rhs.concat)(rhs.single)(rhs.concat)();
console.log('\n', nested(["abc", "def", [4, 8]], "end", 10000, "Please", [], ["yeah!"]).toString());
//(((abc)|(def)){4,8}end){10000}Please/

var re = new rhs("start");
var func1 = re.compose(rhs.alter)(rhs.repeat)();
var func2 = re.compose(func1)(rhs.alter)(rhs.repeat)(rhs.concat)();
console.log('\n',func2(["friend group", [4, 8]], "[^Soham]", 10000, " Dear Bodik, please be merciful on our grades").toString());
// ((((start)|(friend group)){4,8})|([^Soham])){10000} Dear Bodik, please be merciful on our grades

var re = new rhs("Friends ");
var func1 = rhs.compose(rhs.alter)(rhs.repeat)();
var func2 = re.compose(rhs.concat)();
var nested = re.compose(func1)(func2)();
console.log('\n', nested([["HongJun", "Soham "], 100000], "wee", "HongJun").toString());

//returns 'Friends HongJun'
