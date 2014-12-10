var REtoAST = require('./REtoAST.js');
/*{
	start: []
	end: []
	current: " "
	transitions: [
					{start: "", end: "", character: ""}
					]
}
*/

function automata() {
	this.states = [];
	this.startState = "";
	this.finalState = "";
	this.transitions = [];
}

function transition(startState, endState, character) {
	this.startState = startState;
	this.endState = endState;
	this.character = character;
}
automata.prototype.addState = function(state) {
	this.states.push(state);
}

automata.prototype.addTransition = function(startState, endState, character) {
	this.transitions.push(new transition(startState, endState, character));
}

automata.prototype.setStartState = function(state) {
	this.startState = state;
}

automata.prototype.setFinalState = function(state) {
	this.finalState = state;
}

automata.fromRE = function(regularExp) {
	ast = REtoAST.parse(regularExp);
	return automata.ASTtoRE(ast);
}


count = 0;
function uniquegen() {
	return "s"+count++;
}

automata.ASTtoRE = function (ast) {
	switch(ast.type) {
		case "literal":
			var s1 = uniquegen();
			var s2 = uniquegen();
			var a = new automata();
			a.states.push(s1);
			a.states.push(s2);
			a.setStartState(s1);
			a.setFinalState(s2);
			a.addTransition(s1, s2, ast.val);
			return a;
		case ".":
			var a1 = this.ASTtoRE(ast.arg1);
			var a2 = this.ASTtoRE(ast.arg2);
			var a3 = new automata();
			a3.states = a1.states.concat(a2.states);
			a3.transitions = a1.transitions.concat(a2.transitions);
			a3.setFinalState(a2.finalState);
			a3.setStartState(a1.startState);
			a3.addTransition(a1.finalState, a2.startState, "_");
			return a3;
      	case "|":
			break;
		case "*":
			break;
		case "+":
			break;
		case "?":
			break;
		case "range":
			break;
    	case "set":
			break;
		default:
			//throw Error("Unrecognized AST node ");
	}
}


automata.prototype.toRE = function(){
	// TODO: WRITE MAGICAL CODE HERE
}

if (typeof(module)!== 'undefined') {
	module.exports = {
		automata: automata
	};
}


console.log(automata.fromRE("ab"));