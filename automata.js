var REtoAST = require('./REtoAST.js');

var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split("");
var epsilon = '';


Array.prototype.contains = function(mxd,strict) {
    for(i in this) {
	if(this[i] == mxd && !strict) return true;
	else if(this[i] === mxd) return true;
    }
    return false;
}

Array.prototype.unique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

Array.prototype.remove = function(obj){
	return this.splice(this.indexOf(obj), 1);
}

function clone(source){
	destination = {};
	for (key  in source){
		destination[key] = source[key];
	}
	return destination;
}

function automata() {
	this.states = [];
	this.startState = '';
	this.finalState = [];
	this.transitions = {}
}


automata.prototype.addState = function(state) {
	this.states.push(state);
	this.transitions[state] = {};
}

automata.prototype.addTransition = function(startState, endState, character) {
	//console.log("adding transition "+startState+" -----"+character+"---->  "+endState);
	if (!this.transitions.hasOwnProperty(startState))
		this.transitions[startState] = {};

	if (!this.transitions[startState].hasOwnProperty(character))
		this.transitions[startState][character] = [];
	this.transitions[startState][character].push(endState);
}

automata.prototype.removeTransition = function(startState, endState, character){
	//Assume DFA
	//console.log("removing transition "+startState+" -----"+character+"---->  "+endState);
	if (this.transitions[startState].hasOwnProperty(character)) {
		if (this.transitions[startState][character].length == 1){
			if (this.transitions[startState][character][0] === endState)
				delete this.transitions[startState][character];
		} else if (this.transitions[startState][character].length == 0){
			delete this.transitions[startState][character];
		} else {
			this.transitions[startState][character].remove(endState);
		}
	}
}

automata.prototype.getTransition = function(start, end){
	for (character in this.transitions[start]){
		if (this.transitions[start][character].contains(end))
			return character;
	}
	return null;
}

automata.prototype.cleanUpTransitionsAndStates = function (){
		for (s in this.transitions){
			if (Object.keys(this.transitions[s]).length == 0){
				delete this.transitions[s];
				if (!this.finalState.contains(s))
					this.states.remove(s);
			}
				
		}
	}

automata.prototype.setStartState = function(state) {
	this.startState = state;
}

automata.prototype.setFinalState = function(state) {
	this.finalState = [state];
}

automata.prototype.addFinalState = function(state) {
	this.finalState.push(state);
}

automata.prototype.getFinalState = function() {
	return this.finalState[0];
}

automata.fromRE = function(regularExp) {
	ast = REtoAST.parse(regularExp);
	return automata.ASTtoAutomata(ast);
}


count = 0;
function uniquegen() {
	return "s"+count++;
}

automata.prototype.merge = function(a) {
	for (i=0; i<a.states.length; i++)
		this.addState(a.states[i]);
	for (state in a.transitions){
		for (character in a.transitions[state]){
			for (i = 0; i < a.transitions[state][character].length; i++) {
				this.addTransition(state, a.transitions[state][character][i], character);
			}
		}
	}
	return this;
}




automata.ASTtoAutomata = function (ast) {
	switch(ast.type) {
		case 'literal':
			var s1 = uniquegen();
			var s2 = uniquegen();
			var a = new automata();
			a.addState(s1);
			a.addState(s2);
			a.setStartState(s1);
			a.setFinalState(s2);
			a.addTransition(s1, s2, ast.val);
			return a;
		case '.':
			var a1 = this.ASTtoAutomata(ast.arg1);
			var a2 = this.ASTtoAutomata(ast.arg2);
			var a3 = new automata();
			a3.merge(a1).merge(a2);
			a3.setFinalState(a2.getFinalState());
			a3.setStartState(a1.startState);
			a3.addTransition(a1.getFinalState(), a2.startState, epsilon);
			return a3;
    	case '|':
    		var s1 = uniquegen();
			var a1 = this.ASTtoAutomata(ast.arg1);
			var a2 = this.ASTtoAutomata(ast.arg2);
			var s2 = uniquegen();
			var a = new automata();
			a.addState(s1);
			a.setStartState(s1);

			a.merge(a1).merge(a2);
			a.addTransition(s1, a1.startState, epsilon);
			a.addTransition(s1, a2.startState, epsilon);
			a.addTransition(a1.getFinalState(), s2, epsilon);
			a.addTransition(a2.getFinalState(), s2, epsilon);
			a.addState(s2);
			a.setFinalState(s2);
		  return a
		case '*':
			var s1 = uniquegen();
			var a = this.ASTtoAutomata(ast.arg);
			var s2 = uniquegen();
			var new_a = new automata();
			new_a.merge(a);
			new_a.addState(s1);
			new_a.setStartState(s1);
			new_a.setFinalState(s2);
			new_a.addState(s2);

			new_a.addTransition(s1, a.startState, epsilon);
			new_a.addTransition(s1, s2, epsilon);
			new_a.addTransition(a.getFinalState(), s2, epsilon);
			new_a.addTransition(a.getFinalState(), s1, epsilon);
			
			return new_a;
		case '+':
			var s1 = uniquegen();
			var a = this.ASTtoAutomata(ast.arg);
			var s2 = uniquegen();
			var new_a = new automata();
			new_a.merge(a);
			new_a.addState(s1);
			new_a.setStartState(s1);
			new_a.addState(s2);
			new_a.setFinalState(s2);
			new_a.addTransition(s1, a.startState, epsilon);
			new_a.addTransition(a.getFinalState(), s2, epsilon);
			new_a.addTransition(s2, s1, epsilon);
			return new_a;
			break;
		case '?':
			var s1 = uniquegen();
			var a = this.ASTtoAutomata(ast.arg);
			var new_a = new automata();
			new_a.setStartState(s1);
			new_a.addState(s1);
			new_a.merge(a);
			new_a.addTransition(s1, a.startState, epsilon);
			new_a.addTransition(s1, a.getFinalState(), epsilon);
			new_a.setFinalState(a.getFinalState());
			return new_a;
		case 'range':
			var result = new automata();
    		var s1 = uniquegen();
    		var s2 = uniquegen();
    		result.setStartState(s1);
    		result.setFinalState(s2);
    		result.addState(s1);
    		result.addState(s2);
    		var from = ast.from.charCodeAt(0); var to = ast.to.charCodeAt(0);
    		for (lp = from; lp <= to; lp ++){
    			var a = this.ASTtoAutomata({type:'literal', val:String.fromCharCode(lp)});
    			result.addTransition(s1, a.startState, epsilon);
    			result.merge(a);
    			result.addTransition(a.getFinalState(), s2, epsilon);
    		}

    		return result;
    	case 'set':
    		var result = new automata();
    		var s1 = uniquegen();
    		var s2 = uniquegen();
    		result.setStartState(s1);
    		result.setFinalState(s2);
    		result.addState(s1);
    		result.addState(s2);
    		for (lp = 0; lp < ast.set.length; lp++) {
    			item = ast.set[lp];
    			var a = this.ASTtoAutomata(item);
    			result.addTransition(s1, a.startState, epsilon);
    			result.merge(a);
    			result.addTransition(a.getFinalState(), s2, epsilon);
    		}
    		return result;
    	case 'not-set':
    		var result = new automata();
    		var s1 = uniquegen();
    		var s2 = uniquegen();
    		result.setStartState(s1);
    		result.addState(s1);
    		result.addState(s2);
    		for (lp = 0; lp < ast.set.length; lp++) {
    			item = ast.set[lp];
    			var a = this.ASTtoAutomata(item);
    			result.addTransition(s1, a.startState, epsilon);
    			result.merge(a);
    			result.addTransition(a.getFinalState(), s2, epsilon);
    		}
    		result.addTransition(s1, s3, epsilon);
    		var s3 = uniquegen();
    		result.setFinalState(s3);
    		return result;
    	case 'group':
    		var a = this.ASTtoAutomata(ast.group);
    		return a;
		default:
			throw Error('Unrecognized AST node ');
	}
}

function getEpsilonTransitionStates(transitions, state){
	var s = [];
	if (!transitions.hasOwnProperty(state))
		return [];
	if (transitions[state].hasOwnProperty(epsilon)){
		transitions[state][epsilon].forEach(function(endState){
			s.push(endState);
			s = s.concat(getEpsilonTransitionStates(transitions, endState));
		});
	}
	return s;
}


automata.prototype.toDFA = function() {
  	startState = this.startState;
	finalStates = this.finalState;
	transitions = clone(this.transitions)
	var dfa = new automata();

	//if start state has epsilon transitions, combine them to form one state
	bigStartState = [startState].concat(getEpsilonTransitionStates(transitions, startState)).join("_");
	dfa.addState(bigStartState);

	if (bigStartState !== startState)
		transitions[bigStartState] = {};

	dfa.setStartState(bigStartState);
		for (startState in transitions){
	  	  for (character in transitions[startState]){
			      endStates = transitions[startState][character];
	        if (character !== epsilon){
	            endStates.forEach(function(endState){
	                transitions[startState][character] = transitions[startState][character].concat(getEpsilonTransitionStates(transitions, endState));
	          })
	        }

		}
	}
	//delete unnecessary transitions
	dfa.transitions = clone(transitions);
	for (s in dfa.transitions){
		if (dfa.states.indexOf(s) == -1){
			delete dfa.transitions[s];
    	}
		else {
			dfa.transitions[s] = {};
    	}
	}

	for (s in dfa.transitions){
		addDFATransition(transitions, s);
	}

	function addDFATransition(transitions, state){
		alphabet.forEach(function(c){
			powerset = state.split("_");
			nextpowerset = [];
			powerset.forEach(function(state){
				if (transitions.hasOwnProperty(state)){
					if (transitions[state].hasOwnProperty(c)){
						result = transitions[state][c];
						nextpowerset = nextpowerset.concat(result);
					}
				}
				
			});
			if (nextpowerset.length > 0){
		        newEndState =  nextpowerset.unique().join("_");//union of states it can possibly go to
				dfa.addTransition(state, newEndState, c);
		        if (!dfa.states.contains(newEndState)) {
		      		dfa.addState(newEndState);
		        	addDFATransition(transitions, newEndState);
		        }
			}
		});
	}


	//To add final states
	dfa.states.forEach(function(bigState){
		bigState.split("_").forEach(function(state){
			if (finalStates.indexOf(state) != -1){
				dfa.addFinalState(bigState);
				return;
			}
		});
	})

	function renameStates(dfa){
		var new_s;
		var old_s;
		for (var i = 0; i < dfa.states.length; i++){
			new_s = uniquegen();
			old_s = dfa.states[i];
			dfa.states[i] = new_s;

			dfa.transitions[new_s] = dfa.transitions[old_s];
			delete dfa.transitions[old_s];

			for (s in dfa.transitions){
				for (c in dfa.transitions[s]){
					for (j = 0; j < dfa.transitions[s][c].length; j++){
						e = dfa.transitions[s][c][j];
						if (e === old_s)
							dfa.transitions[s][c][j] = new_s;
					}
				}
			}

			if (old_s === dfa.startState)
				dfa.setStartState(new_s);

			if (dfa.finalState.contains(old_s))
				dfa.finalState[dfa.finalState.indexOf(old_s)] = new_s;
		}

		return dfa;
	}
	return renameStates(dfa);
}


automata.prototype.toRE = function(){
	// TODO: WRITE MAGICAL CODE HERE
	a = this.toDFA();
	a.addState("start");
	a.addTransition("start", a.startState, epsilon);
	a.startState = "start";
	a.addState("final");
	a.finalState.forEach(function(oldFinalState){
		a.addTransition(oldFinalState, "final", epsilon);
	});
	a.setFinalState("final");

	a.states.filter(function(s) { return s !== "start" && s !== "final";}).forEach(function(Qk){
		t = getIncomingandOutgoingTransitions(a.transitions, Qk);
		t.incoming.forEach(function(incomingT){
			t.outgoing.forEach(function(outgoingT){
				Rij_old = getTransition(a.transitions, incomingT.startState, outgoingT.endState[0]); //null if nothing found
				Rik = incomingT.character;//getTransition(incomingT.startState, Qk);
				Rkj = outgoingT.character;
				Rkk = t.loop.map(function(l) {return "("+l.character+")";}).join("|");

				
				if (Rkk != ''){

					if (Rij_old !== null && Rij_old != epsilon){
						Rikkj = Rik +"(" + Rkk + ")*" + Rkj
						if (Rij_old.length > Rikkj.length)
							Rij = "(" + Rij_old + ")|(" + Rikkj +")";
						else
							Rij = "(" + Rikkj + ")|(" + Rij_old +")";
					}
						
					else
						Rij = Rik +"(" + Rkk + ")*" + Rkj;
				}
					
				else {
					if (Rij_old !== null && Rij_old != epsilon) {
						Rikkj = Rik + Rkj
						if (Rij_old.length > Rikkj.length)
							Rij = "(" + Rij_old + ")|(" + Rikkj +")";
						else
							Rij = "(" + Rikkj + ")|(" + Rij_old +")";
					}
						
					else
						Rij = Rik + Rkj;
				}
					
				if (Rij_old !== null)
					a.removeTransition(incomingT.startState, outgoingT.endState[0], Rij_old);
				a.addTransition(incomingT.startState, outgoingT.endState[0], Rij);
				a.removeTransition(incomingT.startState, Qk, Rik);
				a.removeTransition(Qk, outgoingT.endState[0], Rkj);
				t.loop.forEach(function(l){
					a.removeTransition(Qk, Qk, l.character);
				});
				if (typeof Rkk !== "undefined")
					a.removeTransition(Qk, Qk, Rkk);

			});
		});
		a.states.remove(Qk);

		
		if (a.states.length == 2)
			return;
		
	})

	//a.printDigraph();
	branches = []
	for (character in a.transitions["start"]){
		if (a.transitions["start"][character].contains("final"))
			branches.push("("+character+")");
	}
		
	branches = branches.sort(function(a,b){ console.log(a.length); return b.length - a.length;});
	var re = branches.join("|");
	return re;
	

	function getIncomingandOutgoingTransitions(transitions, Qk){
		result = {incoming:[], outgoing:[], loop:[]};
		for (s in transitions){
			for (c in transitions[s]){
				e = transitions[s][c];
				if (s === Qk){
					if (e[0] === Qk){
						result["loop"].push({character:c});
					} else {
						result["outgoing"].push({endState:e, character:c});
					}
				} else if (e == Qk){
					result["incoming"].push({startState:s, character:c});
				}
			}
		}
		return result;
	}

	function getTransition(transitions, s1, s2){
		for (c in transitions[s1]){
			idx = transitions[s1][c].indexOf(s2);
			if (idx != -1)
				return c;
			else
				return null;
		}
	}
}



automata.intersect = function(a1, a2){
	a1 = a1.toDFA();
	a2 = a2.toDFA();
	var result = new automata();
	var connector = "x";
	result.setStartState(a1.startState+connector+a2.startState);
	result.setFinalState(a1.getFinalState()+connector+a2.getFinalState());
	for (i = 0; i < a1.states.length; i++){
		for (j = 0; j < a2. states.length; j++){
			result.addState(a1.states[i]+connector+a2.states[j]);
		}
	}
	for (var start_a1 in a1.transitions){
		for (var char_a1 in a1.transitions[start_a1]){
			end_a1 = a1.transitions[start_a1][char_a1];
			for (var start_a2 in a2.transitions){
				for (var char_a2 in a2.transitions[start_a2]){
					end_a2 = a2.transitions[start_a2][char_a2];
					if (char_a1 === char_a2){
						startState = start_a1+connector+start_a2;
						endState = end_a1+connector+ end_a2;
						result.addTransition(startState, endState, char_a1);
					}
				}
			}
		}
	}

	result.setStartState(a1.startState+connector+a2.startState);
	a1.finalState.forEach(function(a1_finalState){
		a2.finalState.forEach(function(a2_finalState){
			result.addFinalState(a1_finalState+connector+a2_finalState);
		})
	})

	
	result.cleanUpTransitionsAndStates()
	return result;
}

automata.complement = function(a1){
	//convert to DFA
	var result = a1.toDFA();
	//console.log("complement - after getting DFA")
	//result.printDigraph()
	var finalState = "final"+uniquegen();

	//flip accepting and nonaccepting states
	oldFinalStates = result.finalState;
	result.finalState = [];
	result.states.forEach(function(state){
		if (!oldFinalStates.contains(state)){
			result.addFinalState(state);
		}
	});

	result.addState(finalState);
	result.addFinalState(finalState);
	alphabet.forEach(function(c){
		result.addTransition(finalState, finalState, c);
	});
	result.states.forEach(function(s){
		alphabet.forEach(function(c){
			if (!Object.keys(result.transitions[s]).contains(c)){
				result.addTransition(s, finalState, c);
			}
		})
	});
	
	return result;
}

automata.prototype.printDigraph = function(){
  var a = this;
	var digraph = 'digraph{\n';
	digraph+="\t"+a.startState+" [shape=house];\n";
	for (start in a.transitions){
		for (character in a.transitions[start]){
			a.transitions[start][character].forEach(function (end){

			if (character === ''){
					digraph+= '\t'+start + ' -> '+ end + ';\n'
			}
			else {
				digraph+= '\t'+start + ' -> '+ end + ' [label=\"'+ character+'\", weight=\"'+ character+'\"];\n' 
			}

			if (a.finalState.contains(end))
				digraph += '\t'+end+' [shape=doublecircle];\n';
			});
		}
	}
	digraph += '\t}';
	console.log(digraph);
}

var a = automata.fromRE("cd*a");
var b = automata.complement(automata.complement(a));
console.log(b.toRE());	

if (typeof(module)!== 'undefined') {
	module.exports = {
		automata: automata
	};
}