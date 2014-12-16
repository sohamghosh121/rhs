var automata = require('./automata.js').automata;
require('./ArrayLibrary.js')
// The RHS object which contains the functions

function rhs(string) {
    this.version = "1.0.0";
    this.exp = new RegExp(string);
    if (arguments.length === 0) {
        this.string = '';
    } else {
        this.string = string;
    }
}

/*
	Regular Expression built in primitives that a user might use frequently:
	E.g.
		- Email
		- HTML tag
		- Phone number
		- IP address
*/
rhs.alphabet = new rhs("[a-zA-Z]");
rhs.lower = new rhs("[a-z]");
rhs.upper = new rhs("[A-Z]");
rhs.name = new rhs("[a-z0-9]");
rhs.email = new rhs("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
rhs.mastercard = new rhs("5[1-5][0-9]{14}");
rhs.ipaddress = new rhs("(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])");
rhs.control = new rhs("\c");
rhs.whitespace = new rhs("\s");
rhs.notwhitespace = new rhs("\S");
rhs.digit = new rhs("[0-9]");
rhs.notdigit = new rhs("\D");
rhs.word =  new rhs("\w");
rhs.notword = new rhs("\W");
rhs.octal = new rhs("\O");


/*
*	Common regular expression operators:
*		- concat: R.R
*		- alter: R|R
*		- repeat: R{Num}
*		- group:
*		- single: R{1}
*/
rhs.prototype.concat = function concat()  {
    if (arguments.length == 0) {
      throw Error("No arguments passed");
    }
    var re = this;
    if (re.string === undefined) {
      re = new rhs("");
    }
    var concatargs = [];
    for (k in arguments)
      concatargs.push(arguments[k]);
    concatargs = [re.string].concat(concatargs);
    var newregexp = concatargs.join("");
    return new rhs(newregexp);
}
rhs.concat = rhs.prototype.concat;

rhs.prototype.alter = function alter()  {
	if (arguments.length == 0) {
		throw Error("No arguments passed in.");
	}
	var re = this
	if (re.string === undefined) {
    	re = new rhs("");
	}

	var alterargs = [];
	for (k in arguments)
		alterargs.push(arguments[k]);
	alterargs = [re.string].concat(alterargs);
	alterargs = alterargs.map(function(arg){ if (arg.length != 1) return "("+arg+")"; else return arg;});
	var newregexp = alterargs.join("|");
	return new rhs(newregexp);
}

rhs.alter = rhs.prototype.alter;

rhs.prototype.repeat = function repeat(from, to) {
	if (from === 1 && to === undefined) {
		return new rhs("(" + this.string + "){1}");
	}
	re = this
	if (re.string === undefined) {
	 throw new Error("Undefined rhs object");
	}
	if (to <= from || from < 0)
		throw new Error("Repeat parameters are out of bounds");


	if (this.string.length > 1)
		this.string = "(" + this.string + ")";

	switch(to){
		case undefined:
			return new rhs(this.string + "{" + from + "}");
		case Infinity:
			if (from == 0)
				return new rhs(this.string+"*");
			else if (from == 1)
				return new rhs(this.string + "+");
			else
				return new rhs(this.string + "{" + from + ",}");
		default:
			if (from == 0 && to == 1)
				return new rhs(this.string + "?");
			else
				return new rhs(this.string + "{" + from + "}");
	}
}

rhs.repeat = rhs.prototype.repeat;

rhs.prototype.single = function single() {
    if (this.string === undefined) {
     throw Error("Undefined rhs object");
  }
	  if (arguments.length == 0) {
      	return new rhs('(' + this.string + '){1}');
	  } else {
      var re = this.string;
      for (var i = 0; i < arguments.length; i++) {
        re = re + '(' + arguments[i] + '){1}';
    }
    return new rhs(re);
    }
}
rhs.single = rhs.prototype.single;

rhs.prototype.pivot = function pivot(string1, string2) {
  if (typeof this === 'object') {
      if (arguments.length !== 1) {
          throw Error("Invalid number of arguments given.")
      } else {
          return new rhs(this.string + string1 + this.string)
      }
    }
   else {
      if (arguments.length !== 2) {
          throw Error("Invalid number of arguments given.")
      } else {
          if (typeof(string1) === 'string' && typeof(string2) === 'string') {
              return new rhs(string1 + string2 + string1);
          } else if (typeof(string1) === 'string') {
              return new rhs(string1 + string2.string + string1);
          } else if (typeof(string2) === 'string') {
              return new rhs(string1.string + string2 + string1.string);
          } else {
              return new rhs(string1.string + string2.string + string1.string);
        }
    }
   }
}
rhs.pivot = rhs.prototype.pivot;

rhs.prototype.not = function not() {
	if (arguments.length == 0) {
    	throw Error("Invalid number of arguments given.")
    }
  	if (arguments.length > 0) {
		var re = this.string;
		var exclude = '[^'
		for (var i = 0; i < arguments.length; i++) {
			if (arguments[i].constructor === rhs)
				exclude = exclude + arguments[i].string
			else if (typeof arguments[i] === "string")
				exclude = exclude + arguments[i];
			else
				throw new Error("Invalid arguments (arg "+(i+1)+") to rhs.not()");
}
      return new rhs(this.string + exclude + ']')
   }
}
rhs.not = rhs.prototype.not

rhs.prototype.toString = function toString(readable) {
	if (readable !== "undefined" && readable){
		if (this.string === rhs.ipaddress.string)
			return  "IP address";
		else
			return this.string;
	}
	else {
		return this.string
	}
}
rhs.toString = rhs.prototype.toString

rhs.group = function group() {
	var re = ""
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] === "string"){
			re = re + arguments[i]
		}
		else if (arguments[i].constructor === rhs) {
			re = re + arguments[i].string
		}
		else {
			throw Error("Invalid argument passed in");
		}
	}
	return new rhs("[" + re + "]");
}

rhs.range = function range(c1, c2) {
	if (isNumber(c1) && isNumber(c2)) {
		if (parseInt(c1) > 9 || parseInt(c1) < 0 || parseInt(c2) > 9 || parseInt(c2) < 0)
			throw Error("Arguments to range("+c1+","+c2+") out of bounds")
		return new rhs(c1+"-"+c2);
	}
	//TODO: need to do error checking here if weird characters are passed in
	else {
		c1_upperCase = isUpperCase(c1);
		c2_upperCase = isUpperCase(c2);
		if ((c1_upperCase && c2_upperCase)||(!c1_upperCase && !c2_upperCase))
			return new rhs(c1+"-"+c2)
		else
			throw Error("Invalid arguments to range("+c1+","+c2+")");
	}
}


rhs.prototype.validate = function() {
}

/*
	JavaScript Regular Expression functions support
		- exec
		- test
		- match
		- search
		- replace
		- split
*/

/* This next section of code allows rhs users to cleanly execute their
 * regular expressions without having to manually extract the expression
 * and then call on the JavaScript regular expression methods.
 */
rhs.prototype.exec = function(string) {
  return this.exp.exec(string)
}
rhs.exec = rhs.prototype.exec

rhs.prototype.test = function(string) {
  return this.exp.test(string)
}
rhs.test = rhs.prototype.test

rhs.prototype.match = function(string) {
  return string.match(this.exp)
}
rhs.match = rhs.prototype.match

rhs.prototype.search = function(string) {
  return string.search(this.exp)
}
rhs.search = rhs.prototype.search

rhs.prototype.replace = function(string, replaceString) {
  return string.replace(replaceString)
}
rhs.replace = rhs.prototype.replace

rhs.prototype.split = function(string) {
	return string.split(this.exp);
}
rhs.split = rhs.prototype.split

/*
*	Set operations on regular expressions
*
*/

rhs.union = function union() {
    if (arguments.length == 0 || arguments.length == 1) {
	throw "Need at least 2 arguments";
    }

    var re = ""
    var list = []

    for (var i = 0; i < arguments.length; i++) {

	if (arguments[i].constructor === rhs) {
	    if (!(list.contains(arguments[i].string))){
		re =  re + arguments[i].string + "|"
	    }
	    list.push(arguments[i].string)
	} else if (typeof arguments[i] === "string"){

    if (!(list.contains(arguments[i]))){
		re =  re + arguments[i] + "|"
	    }
	    list.push(arguments[i])
	}
    }

    re = re.substring(0, re.length - 1)

    re = new rhs(re)
    return re

}

/*
* The intersect function takes in two regular expressions re1, re2 and returns a regular expression that matches the
* set of strings matched by both re1 and re2.
* First, the regular expressions are converted to automata which are handled in automata.js for converting from regular expression
* Second this automaton is converted back to regular expression using automata.toRE()
*/
rhs.intersect = function intersect(re1, re2) {
	if (re1.constructor === rhs)
		re1 = re1.string;
	if (re2.constructor === rhs)
		re2 = re2.string;
	return new rhs(automata.intersect(automata.fromRE(re1), automata.fromRE(re2)).toRE());
}

rhs.prototype.complement = function complement(){
	return new rhs(automata.complement(automata.fromRE(this.string)).toRE());
}

rhs.complement = function complement(re){
	if (re.constructor === rhs)
		return re.complement();
	else if (typeof re === "string")
		return new rhs(re).complement();
}

/*
*	Helper functions:
*		- check if a number
*		- check if a character is upper case
*/
function isNumber(x) {
	return !isNaN(parseInt(x));
}

function isUpperCase(x){
	return x.toUpperCase === x;
}

/* rhs.compose allows rhs to support new function composition. It returns a new function that
 * maps input arguments to functions one-to-one and is to be read left from right.
 * An example usage would be:
 * var func1 = rhs.compose(rhs.repeat)(rhs.concat)(rhs.alter)(rhs.pivot)();
 * var result = func1("a", 4, "fgh", "e", ".")
 * where the resulting regular expression is: /((a){4}fgh)|(e).((a){4}fgh)|(e)/
 *
 * Can also extend composed function with further nested function composition:
 * var func0 = rhs.compose(rhs.concat)(rhs.alter)(rhs.repeat)();
 * var nested = rhs.compose(func0)(rhs.concat)(rhs.repeat)(rhs.concat)();
 * var result = nested(["start with ", "abc", "def", [4, 8]], "end", 10000, "Please");
 * where the resulting regular expression is /(((start with abc)|(def)){4,8}end){10000}Please/
 *
 * var re = new rhs("start");
 * var func1 = re.compose(rhs.alter)(rhs.repeat)();
 * var func2 = re.compose(func1)(rhs.alter)(rhs.repeat)(rhs.concat)();
 * var result = func2(["def", [4, 8]], "end", 10000, "Please");
*/

rhs.prototype.compose = function compose(f) {
        var reState = null;
        if (this && typeof this === 'object'){
            var reState = new rhs(this.string)
        }
        var queue = f ? [f] : [];
        var fn = function fn(g) {
            if (arguments.length) {
                queue.push(g);
                return fn;
        }
        return function composed() {
            var queueSize = queue.length;
            var args = Array.prototype.slice.call(arguments);
            if (arguments.length < 1) {
                return composed;
            } else if (arguments.length < queue.length) {
                if (reState) {
                    var re = reState
                    var start = arguments.length
                } else if (!(args[0] instanceof Array)){
                  var re = new rhs(args[0])
                  args = args.slice(1)
                  var start = arguments.length - 1
                } else {
                  var re = new rhs("")
                  var start = arguments.length
                }
                for (var i = 0; i < args.length; i++) {
                    if (args[i] === undefined || args[i] === []) {
                        re = queue[i].call(re.string)
                    }
                    else if (args[i] instanceof Array) {
                        if (queue[i].name === 'composed') {
                            re = queue[i](re, args);
                        } else {
                            re = queue[i].apply(re, args[i]);
                        }
                    }
                    else {
                        re = queue[i].apply(re, [args[i]]);
                    }
                  }
                queue = queue.slice(start);
                reStart = re;
                return function curried() {
                  var args = Array.prototype.slice.call(arguments);
                  re = reStart;
                  for (var i = 0; i < queue.length; i++) {
                      if (args[i] === undefined || args[i] === []) {
                          re = queue[i].call(re.string)
                      }
                      else if (args[i] instanceof Array) {
                          if (queue[i].name === 'composed') {
                              re = queue[i](re, args);
                         } else {
                              re = queue[i].apply(re, args[i]);
                          }
                      }
                      else {
                          re = queue[i].apply(re, [args[i]]);
                      }
                    }
                return re;
                }
            } else {
                if (reState) {
                    var re = reState
                } else if (!(args[0] instanceof Array)){
                  var re = new rhs(args[0])
                  args = args.slice(1)
                } else {
                  var re = new rhs("")
                }
                for (var i = 0; i < queue.length; i++) {
                    if (args[i] === undefined || args[i] === []) {
                        re = queue[i].call(re.string)
                    }
                    else if (args[i] instanceof Array) {
                        if (queue[i].name === 'composed') {
                            re = queue[i](re, args);
                        } else {
                            re = queue[i].apply(re, args[i]);
                        }
                    }
                    else {
                        re = queue[i].apply(re, [args[i]]);
                    }
                  }
                return re
            }
        }
      };
    return fn;
};
rhs.compose = rhs.prototype.compose

// Allows users to import rhs code
if (typeof(module)!== 'undefined') {
	module.exports = {
		rhs: rhs
	}
}
