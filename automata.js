var REtoAST = require('./REtoAST.js');

var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*(){}[],./?:~'.split("");
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
	//console.log("Adding transition: "+startState+" -----"+character+"-----> "+endState)
	//console.log(this);
	if (!this.transitions[startState].hasOwnProperty(character))
		this.transitions[startState][character] = [];
	this.transitions[startState][character].push(endState);
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
	return automata.ASTtoRE(ast);
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




automata.ASTtoRE = function (ast) {
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
			var a1 = this.ASTtoRE(ast.arg1);
			var a2 = this.ASTtoRE(ast.arg2);
			var a3 = new automata();
			a3.merge(a1).merge(a2);
			a3.setFinalState(a2.getFinalState());
			a3.setStartState(a1.startState);
			a3.addTransition(a1.getFinalState(), a2.startState, epsilon);
			return a3;
    	case '|':
    		var s1 = uniquegen();
			var a1 = this.ASTtoRE(ast.arg1);
			var a2 = this.ASTtoRE(ast.arg2);
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
			var a = this.ASTtoRE(ast.arg);
			var s2 = uniquegen();
			var new_a = new automata();
			new_a.merge(a);
			new_a.addState(s1);
			new_a.setStartState(s1);
			new_a.addTransition(s1, a.startState, epsilon);
			new_a.addTransition(s1, s2, epsilon);
			new_a.addTransition(a.getFinalState(), s1, epsilon);
			new_a.setFinalState(s2);
			new_a.addState(s2);
			return new_a;
		case '+':
			var s1 = uniquegen();
			var a = this.ASTtoRE(ast.arg);
			var s2 = uniquegen();
			var new_a = new automata();
			new_a.merge(a);
			new_a.addState(s1);
			new_a.setStartState(s1);
			new_a.addTransition(s1, a.startState, epsilon);
			new_a.addTransition(a.getFinalState(), s1, epsilon);
			new_a.setFinalState(s2);
			new_a.addState(s2);
			return new_a;
			break;
		case '?':
			var s1 = uniquegen();
			var a = this.ASTtoRE(ast.arg);
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
    			var a = this.ASTtoRE({type:'literal', val:String.fromCharCode(lp)});
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
    			var a = this.ASTtoRE(item);
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
    			var a = this.ASTtoRE(item);
    			result.addTransition(s1, a.startState, epsilon);
    			result.merge(a);
    			result.addTransition(a.getFinalState(), s2, epsilon);
    		}
    		result.addTransition(s1, s3, epsilon);
    		var s3 = uniquegen();
    		result.setFinalState(s3);
    		return result;
    	case 'group':
    		var a = this.ASTtoRE(ast.group);
    		return a;
		default:
			throw Error('Unrecognized AST node ');
	}
}

function getEpsilonTransitionStates(transitions, state){
	var s = [];
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
  transitions = clone(this.transitions);
	finalStates = this.finalState;
	var dfa = new automata();
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

  console.log(transitions);
	dfa.transitions = clone(transitions);
  for (startState in dfa.transitions){
		for (character in dfa.transitions[startState]){
			endStates = dfa.transitions[startState][character];
			if (character !== epsilon){
        newState = endStates.join('_');
        console.log("added state: "+newState);
				dfa.addState(newState);
			}

		}
	}

	//delete unnecessary transitions
	for (s in dfa.transitions){
		if (dfa.states.indexOf(s) == -1){
      console.log(s)
			delete dfa.transitions[s];
    }
		else {
			dfa.transitions[s] = {};
    }
	}

	for (s in dfa.transitions){
		alphabet.forEach(function(c){
			powerset = s.split("_");
			nextpowerset = [];
			powerset.forEach(function(state){
				if (transitions[state].hasOwnProperty(c)){
					result = transitions[state][c];//.filter(function(s){return s.split("_").length == 1;});
					nextpowerset = nextpowerset.concat(result);
				}
			});
			if (nextpowerset.length > 0){
        newEndState =  nextpowerset.unique().join("_");
        if (!dfa.states.contains(newEndState))
          dfa.addState(newEndState);
				dfa.addTransition(s, newEndState, c);
			}
		});
	}
	dfa.states.forEach(function(bigState){
		bigState.split("_").forEach(function(state){
			if (finalStates.indexOf(state) != -1){
				dfa.addFinalState(bigState);
				return;
			}
		});
	})


	dfa.printDigraph();
//	console.log(dfa)
	return dfa;
}

function NFAtoGNFA(nfa) {
	var gnfa = new automata();
	gnfa.setStartState('s_start');
	gnfa.setFinalState('s_final');
	gnfa.addTransition('s_start', nfa.startState, '');
	nfa.finalState.forEach(function(fs){ gnfa.addTransition(fs, 's_final', '');});
	gnfa.transitions = gnfa.transitions.concat(nfa.transitions);
	gnfa.state = gnfa.states.concat(nfa.states);
	return gnfa;
}

automata.prototype.toRE = function(){
	// TODO: WRITE MAGICAL CODE HERE
	a = this;
	var i = 0;
	a.states.filter(function(q){return (q !== a.startState)&&!(q in a.finalState);})
				.forEach(function(qRip){
					//console.log('\n\n');
					//console.log('qRip --- '+qRip);
					temp = incomingAndOutgoingTransitions(qRip);
					incomingTransitions = temp.incoming;
					loopTransitions = temp.loop;
					outgoingTransitions = temp.outgoing;

					Rrip = loopTransitions.map(function(loopT){ return loopT.character;}).join('|');
					incomingTransitions.forEach(function (incomingT){
						if (outgoingTransitions.length > 1){

						}

						outgoingTransitions.forEach(function(outgoingT){
							//console.log(incomingT);
							//console.log(outgoingT)
							a.transitions.remove(incomingT);
							a.transitions.remove(outgoingT);
							if (Rrip !== '')
								a.addTransition(incomingT.startState, outgoingT.endState, incomingT.character + '(' + Rrip + ')*' + outgoingT.character);
							else
								a.addTransition(incomingT.startState, outgoingT.endState, incomingT.character + outgoingT.character);

								//console.log('start: '+incomingT.startState+' end: '+outgoingT.endState+' char: '+incomingT.character + outgoingT.character)
						});
					});
				a.states.remove(qRip);
				i++;
				a.printDigraph();

	});
	//console.log(a.transitions)
	//return a.transitions[0].character;

	function incomingAndOutgoingTransitions(state){
		incomingTransitions = [];
		outgoingTransitions = [];
		loopTransitions = [];
		a.transitions.forEach(function(t){
			if (t.endState === state){
				if (t.startState === state)
					loopTransitions.push(t);
				else
					incomingTransitions.push(t);
			}
			else if (t.startState === state)
				outgoingTransitions.push(t);
		});
		return {incoming: incomingTransitions, loop: loopTransitions, outgoing: outgoingTransitions};
	}
}

if (typeof(module)!== 'undefined') {
	module.exports = {
		automata: automata
	};
}

automata.intersect = function(a1, a2){
	var result = new automata();
	result.setStartState(a1.startState+"_"+a2.startState);
	result.setFinalState(a1.getFinalState()+"_"+a2.getFinalState());
	for (i = 0; i < a1.states.length; i++){
		for (j = 0; j < a2. states.length; j++){
			result.addState(a1.states[i]+"_"+a2.states[j]);
		}
	}
	for (var start_a1 in a1.transitions){
		for (var char_a1 in a1.transitions[start_a1]){
			end_a1 = a1.transitions[start_a1][char_a1];
			for (var start_a2 in a2.transitions){
				for (var char_a2 in a2.transitions[start_a2]){
					end_a2 = a2.transitions[start_a2][char_a2];
					if (char_a1 === char_a2){
						startState = start_a1+'_'+start_a2;
						endState = end_a1+'_'+ end_a2;
						result.addTransition(startState, endState, char_a1);
					}
				}
			}
		}
	}

	result.setStartState(a1.startState+'_'+a2.startState);
	result.setFinalState(a1.getFinalState()+'_'+a2.getFinalState());


	console.log(result);

	return result;
}

automata.complement = function(a1){
	var result = new automata();
	result.states = a1.states;
	result.addState('sf');
	result.setStartState(a1.startState);
	for (lp = 0; lp < result.states.length; lp++){
		if (!(result.states[lp] in a1.finalState))
			result.addFinalState(result.states[lp]);
	}
	result.transitions = a1.transitions;

	for (lp = 0; lp < result.transitions.length; lp++){
		//TODO: magic code
	}
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

//var a = automata.fromRE('a|c');
//var a = automata.fromRE('(a|b)+bcd');

var a = new automata();
a.states = ["s0", "s1","s2","s3","s4","s5","s6","s7","s8","s9"];
a.startState = "s0";
a.finalState = ["s9"];
a.transitions = {"s0": {"": ["s1", "s3"] }, "s1": {"b": ["s2"] }, "s3": {"a": ["s4"] }, "s2": { "": ["s5"] }, "s4": { "": ["s5"] }, "s5": { "": ["s0", "s6"] }, "s6": {"b": ["s7"]}, "s7": {"c": ["s8"]}, "s8": {"d": ["s9"] }, "s9": {} }
//a.printDigraph();
a.toDFA();
//a.toDFA();
//a.printDigraph()
//var b = automata.fromRE('abc');
//b.printDigraph();
//automata.intersect(a, b).printDigraph();
//console.log(get""TransitionStates(a.transitions, 's3'));
//console.log(JSON.stringify(a,null,4));
//a.toDFA();
