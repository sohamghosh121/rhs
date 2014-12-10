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
    		var s1 = uniquegen();
			var a1 = this.ASTtoRE(ast.arg1);
			var a2 = this.ASTtoRE(ast.arg2);
			var s2 = uniquegen();
			var a = new automata();
			a.states.push(s1);
			a.setStartState(s1);

			a.states = a.states.concat(a1.states);
			a.states = a.states.concat(a2.states);
			a.addTransition(s1, a1.startState, '_')
			a.addTransition(s1, a2.startState, '_')
			a.transitions = a.transitions.concat(a1.transitions);
			a.transitions = a.transitions.concat(a2.transitions);
			a.addTransition(a1.finalState, s2, '_')
			a.addTransition(a2.finalState, s2, '_')
			a.states.push(s2);
			a.setFinalState(s2);
		  return a
		case "*": 
			var s1 = uniquegen();
			var a = this.ASTtoRE(ast.arg);
			var s2 = uniquegen();
			var new_a = new automata();
			new_a.states.push(s1);
			new_a.setStartState(s1);
			new_a.addTransition(s1, a.startState, "_");
			new_a.addTransition(s1, s2, "_");
			new_a.addTransition(a.finalState, s1, "_");
			new_a.states = new_a.states.concat(a.states);
			new_a.transitions = new_a.transitions.concat(a.transitions);
			new_a.setFinalState(s2);
			new_a.states.push(s2);
			return new_a;
		case "+":
			var s1 = uniquegen();
			var a = this.ASTtoRE(ast.arg);
			var s2 = uniquegen();
			var new_a = new automata();
			new_a.states.push(s1);
			new_a.setStartState(s1);
			new_a.addTransition(s1, a.startState, "_");
			new_a.addTransition(a.finalState, s1, "_");
			new_a.states = new_a.states.concat(a.states);
			new_a.transitions = new_a.transitions.concat(a.transitions);
			new_a.setFinalState(s2);
			new_a.states.push(s2);
			return new_a;
			break;
		case "?":
			var s1 = uniquegen();
			var a = this.ASTtoRE(ast.arg);
			var new_a = new automata();
			new_a.setStartState(s1);
			new_a.states.push(s1);
			new_a.states = new_a.states.concat(a.states);
			new_a.addTransition(s1, a.startState, "_");
			new_a.transitions = new_a.transitions.concat(a.transitions);
			new_a.addTransition(s1, a.finalState, "_");
			new_a.finalState = a.finalState;
			return new_a;
		case "range":
			var result = new automata();
    		var s1 = uniquegen();
    		var s2 = uniquegen();
    		result.setStartState(s1);
    		result.setFinalState(s2);
    		result.states.push(s1);
    		result.states.push(s2);
    		var from = ast.from.charCodeAt(0); var to = ast.to.charCodeAt(0);
    		for (lp = from; lp <= to; lp ++){
    			var a = this.ASTtoRE({type:"literal", val:String.fromCharCode(lp)});
    			result.addTransition(s1, a.startState, "_");
    			result.transitions = result.transitions.concat(a.transitions);
    			result.states = result.states.concat(a.states);
    			result.addTransition(a.finalState, s2, "_");
    		}

    		return result;
    	case "set":
    		var result = new automata();
    		var s1 = uniquegen();
    		var s2 = uniquegen();
    		result.setStartState(s1);
    		result.setFinalState(s2);
    		result.states.push(s1);
    		result.states.push(s2);
    		for (lp = 0; lp < ast.set.length; lp++) {
    			item = ast.set[lp];
    			var a = this.ASTtoRE(item);
    			result.addTransition(s1, a.startState, "_");
    			result.transitions = result.transitions.concat(a.transitions);
    			result.states = result.states.concat(a.states);
    			result.addTransition(a.finalState, s2, "_");
    		}
    		return result;
    	case "not-set":
    		var result = new automata();
    		var s1 = uniquegen();
    		var s2 = uniquegen();
    		result.setStartState(s1);
    		result.states.push(s1);
    		result.states.push(s2);
    		for (lp = 0; lp < ast.set.length; lp++) {
    			item = ast.set[lp];
    			var a = this.ASTtoRE(item);
    			result.addTransition(s1, a.startState, "_");
    			result.transitions = result.transitions.concat(a.transitions);
    			result.states = result.states.concat(a.states);
    			result.addTransition(a.finalState, s2, "_");
    		}
    		result.addTransition(s1, s3, "_");
    		var s3 = uniquegen();
    		result.setFinalState(s3);
    		return result;

		default:
			throw Error("Unrecognized AST node ");
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

automata.intersect = function(a1, a2){
	var result = new automata();
	for (i = 0; i < a1.states.length; i++){
		for (j = 0; j < a2. states.length; j++){
			result.states.push("s"+a1.states[i].substring(1)+","+a2.states[i].substring(1));
		}
	}
	for (i = 0; i < a1.transitions.length; i++){
		for (j = 0; j < a2. transitions.length; j++){
			if (a1.transitions[i].character === a2.transitions[j].character){
				startState = "s"+a1.transitions[i].startState.substring(1)+","+a2.transitions[j].startState.substring(1);
				endState = "s"+a1.transitions[i].endState.substring(1)+","+a2.transitions[j].endState.substring(1);
				result.addTransition(startState, endState, a1.transitions[i].character);
			}
				
		}
	}
	result.setStartState("s"+a1.startState.substring(1)+","+a2.startState.substring(1));
	result.setFinalState("s"+a1.finalState.substring(1)+","+a2.finalState.substring(1));
	return result;
}

automata.complement = function(a1){
	var result = new automata();
	result.setStartState(a1.startState);

}


console.log(automata.intersect(automata.fromRE("abe"), automata.fromRE("[b-d]")));
