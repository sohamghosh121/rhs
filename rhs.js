var REtoAST = require('./REtoAST.js');
var automata = require('./automata.js').automata;
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
rhs.prototype.concat = function()  {
	if (arguments.length == 0) {
		throw Error("No arguments passed");
	}
	var re = this
  if (re.string === undefined) {
      re = new rhs("");
  }
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] === "string")
			re = new rhs(re.string + arguments[i]);
		else if (arguments[i].constructor === rhs) {
			re = new rhs(re.string + arguments[i].string);
		}
		else {
			throw Error("Invalid argument passed in");
		}
	}
	return re;
}

rhs.concat = rhs.prototype.concat;

rhs.prototype.alter = function()  {
	if (arguments.length == 0) {
		throw Error("No arguments passed in.");
	}
	var re = this
  if (re.string === undefined) {
      re = new rhs("");
  }
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] === "string") {
			re = new rhs("(" + re.string + ")|(" + arguments[i] + ")");
    }
		else if (arguments[i].constructor === rhs) {
			re = new rhs("(" + re.string + ")|(" + arguments[i].string + ")");
		} else {
			throw "Invalid argument passed in";
		}
	}
	return re;
}

rhs.alter = rhs.prototype.alter;

rhs.prototype.repeat = function(from, to) {
  re = this
  if (re.string === undefined) {
     throw Error("Undefined rhs object");
  }
	if (to < from || from < 0)
		throw Error("Repeat parameters are out of bounds");
  if (from > 1){
		if (to !== undefined) {
			if (to === Infinity)
				return new rhs("(" + this.string + "){" + from + ",}");
			else
				return new rhs("(" + this.string + "){" + from + "," + to + "}");
		}
		else
			return new rhs("(" + this.string + "){" + from + "}");
	}
	else {
		if (to === undefined) {
			if (from == 0) {
					return new rhs("(" + this.string+")*");
			}
			else if (from == 1) {
				return new rhs("(" + this.string + ")+");
			}
		}
		else {
			if (to == 1) {
				return new rhs("(" + this.string + ")?");
			}
			else {
				if (to !== Infinity)
					return new rhs("(" + this.string + "){0" + "," + to + "}");
				else
					return new rhs("(" + this.string + ")*");
			}
		}
	}
}

rhs.repeat = rhs.prototype.repeat;

rhs.prototype.single = function() {
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

rhs.prototype.pivot = function(string) {
  if (arguments.length !== 1) {
      throw Error("Invalid number of arguments given.")
  } else {
      return new rhs(this.string + string + this.string)
  }
}
rhs.pivot = rhs.prototype.pivot;

rhs.prototype.not = function() {
  if (arguments.length == 0) {
      throw Error("Invalid number of arguments given.")
    }
  if (arguments.length > 0) {
      var re = this.string;
      var exclude = '[^'
      for (var i = 0; i < arguments.length; i++) {
          exclude = exclude + arguments[i]
      }
      return new rhs(this.string + exclude + ']')
   }
}
rhs.not = rhs.prototype.not

rhs.prototype.toString = function(readable) {
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

rhs.group = function() {
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
	console.log(re)
	return new rhs("[" + re + "]");
}

rhs.range = function(c1, c2) {
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

rhs.union = function() {
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
	}else if (typeof arguments[i] === "string"){

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
* First, the regular expressions are converted to ASTs and the ASTs are traversed in a somewhat parallel fashion to build up
* an AST that denotes an intersection of the two.
* Second this AST is converted back to regular expression using rhs.ASTtoRE()
*/
rhs.intersect = function(re1, re2) {
	ast1 = rhs.REtoAST(re1);
	ast2 = rhs.REtoAST(re2);
	finalAST = intersectAST(ast1, ast2);
	if (finalAST !== null)
		return rhs.ASTtoRE(finalAST);
	else
		return null;
}

function intersectAST(ast1, ast2) {
	console.log("Comparing '"+ast1.type+"' and '"+ast2.type+"'");
	if (typeof ast1 === "undefined" || typeof ast2 === "undefined") {
		console.log("AST undefined");
		return;
	}
	if (ast1.type === "group")
		return intersectAST(ast1.group, ast2);
	else if (ast2.type === "group")
		return intersectAST(ast1, ast2.group);

	switch(ast1.type) {
		case "literal":
			switch(ast2.type) {
				case "literal":
					if (ast1.val !== ast2.val)  return null
					else return ast1;
				case "range":
					var c = ast1.val;
					if (c >= ast2.from && c <= ast2.to)
						return ast1;
					else
						return null;
				case "set":
					for (i = 0; i < ast2.set.length; i++) {
							var a = ast2.set[i];
							var r = intersectAST(ast1, a);
							if (r !== null)
								return ast1;
					}
				case ".":
					return intersectAST(ast1, ast2.arg2);
				case "|":
					var res1 = intersectAST(ast1, ast2.arg1);
					var res2 = intersectAST(ast1, ast2.arg2);
					if ((res1 !== null)||(res2 !== null))
						return ast1;
				default:
					return null;
			}
		case ".":
			if (ast2.type === ".") {
				var res1 = intersectAST(ast1.arg1, ast2.arg1);
				if (res1 !== null) {
					var res2 = intersectAST(ast1.arg2, ast2.arg2);
					if (res2 !== null)
						return {type:".", arg1:res1, arg2:res2};
					else
						return null;
				}
				else
					return null;
			}
			else if (ast2.type === "*") {
				//TODO: difficult case to handle
				//greedily match as many of ast1.arg1 with ast2.arg as possible
			}
			else {

			}
      case "|":
			if (ast2.type === "|") {
				res = [];
				var res1 = intersectAST(ast1.arg1, ast2.arg1);
				if (res1 !== null) {res.push(res1)};
				var res2 = intersectAST(ast1.arg1, ast2.arg2);
				if (res2 !== null) {res.push(res2)};
				var res3 = intersectAST(ast1.arg2, ast2.arg1);
				if (res3 !== null) {res.push(res3)};
				var res4 = intersectAST(ast1.arg2, ast2.arg2);
				if (res4 !== null) {res.push(res4)};

				//finite number of cases, so do not need to define a recursive method for doing this
				switch (res.length) {
					case 0: return null;
					case 1: return res[0];
					case 2: return {type:"|", arg1:res[0], arg2:res[1]};
					case 3: return {type:"|", arg1:{type:"|", arg1:res[0], arg2:res[1]}, arg2:res[2]};
					case 4: return {type:"|", arg1:{type:"|", arg1:{type:"|", arg1:res[0], arg2:res[1]}, arg2:res[2]}, arg2:res[3]};
				}
			}
		case "*":
			switch(ast2.type) {
				case "*":
					var res = intersectAST(ast1.arg, ast2.arg);
					if (res !== null)
						return {type:"*", arg:res};
					else
						return null;
				case "+":
					var res = intersectAST(ast1.arg, ast2.arg);
					if (res !== null)
						return {type:"+", arg:res};
					else
						return null;
				case "?":
					var res = intersectAST(ast1.arg, ast2.arg);
					if (res !== null)
						return {type:"?", arg:res};
					else
						return null;
				case "repeat":
					var res = intersectAST(ast1.arg, ast2.arg);
					if (res !== null){
						if (ast2.hasOwnProperty("exactly"))
							return {type:"repeat", arg:res, exactly:ast2.exactly};
						else
							return {type:"repeat", arg:res, from:ast2.from, to:ast2.to};
					}
					else
						return null;
				case "literal":
					return intersectAST(ast2, ast1);
			}
			return null;
		case "+":
			switch(ast2.type) {
				case "+":
					var res = intersectAST(ast1.arg, ast2.arg);
					if (res !== null)
						return {type:"*", arg:res};
					else
						return null;
				case "?":
					var res = intersectAST(ast1.arg, ast2.arg);
					if (res !== null)
						return {type:"?", arg:res};
					else
						return null;
				case "*":
					return intersectAST(ast2, ast1);
				case "repeat":
					if (ast2.hasOwnProperty("exactly") && parseInt(ast2.exactly) == 0)
						return null;
					else if (parseInt(ast2.from) == 0)
						return null;

					var res = intersectAST(ast1.arg, ast2.arg);
					if (res !== null){
						if (ast2.hasOwnProperty("exactly"))
							return {type:"repeat", arg:res, exactly:ast2.exactly};
						else
							return {type:"repeat", arg:res, from:ast2.from, to:ast2.to};
					}
					else
						return null;
				}
			return null;
		case "?":
			switch(ast2.type) {
				case "?":
					var res = intersectAST(ast1.arg, ast2.arg);
					if (res !== null)
						return {type:"*", arg:res};
					else
						return null;
				case "+":
				case "*":
					return intersectAST(ast2, ast1);
				case "repeat":
					if (ast2.hasOwnProperty("exactly")){
						if (parseInt(ast2.exactly) > 1)
							return null
						var res = intersectAST(ast1.arg, ast2.arg);
							if (res !== null)
								return {type:"repeat", arg:res, exactly:ast2.exactly};
					}
					else {
						if (parseInt(ast2.from) > 1)
							return null;
						var res = intersectAST(ast1.arg, ast2.arg);
							if (res !== null)
								return {type:"repeat", arg:res, from:ast2.from, to:ast2.to};
					}
				}
			return null;

		case "range":
			if (ast2.type === "range") {
				var c1 = ast1.from;
				var c2 = ast2.from;
				//TODO: some redundancy in code here
				if (isNumber(c1)&&isNumber(c2)){
					var from = Math.max(parseInt(c1), parseInt(c2));
					c1 = ast1.to;
					c2 = ast2.to;
					var to = Math.min(parseInt(c1), parseInt(c2));
					if (to < from)
						return null;
					return {type:"range", from:from, to:to};
				}
				else {
					if ((isUpperCase(c1) && isUpperCase(c2))||(!isUpperCase(c1) && !isUpperCase(c2))) {
						var from = c1 > c2 ? c1 : c2;
						c1 = ast1.to;
						c2 = ast2.to;
						var to = c1 < c2 ? c1 : c2;
						if (to < from)
							return null;
						return {type:"range", from:from, to:to};
					}
					else
						return null;
				}
			}
			else if (ast2.type === "literal")
				return intersectAST(ast2, ast1);

    case "set":
			res = [];
			if (ast2.type ==="set") {
				for (i = 0; i < ast1.set.length; i++) {
					for (j = 0; j < ast2.set.length; j++) {
						var a = ast1.set[i];
						var b = ast2.set[j];
						var r = intersectAST(a, b);
						if (r !== null)
							res.push(r);
					}
				}
				if (res.length > 0)
					return {type:"set", set:res};
			}
			else if (ast2.type === "literal")
				return intersectAST(ast2, ast1);
			else
				return null;

		default:
			console.log(ast1.type);
			//throw Error("Unrecognized AST node ");
	}
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

Array.prototype.contains = function(mxd,strict) {
    for(i in this) {
	if(this[i] == mxd && !strict) return true;
	else if(this[i] === mxd) return true;
    }
    return false;
}

/*
*	Handling RE to ASTs and vice versa
*	(especially needed for intersect operation):
*/

rhs.REtoAST = function(re) {
	if (re.constructor === rhs)
		return REtoAST.parse(re.string);
	else
		return REtoAST.parse(re);
}

rhs.ASTtoRE = function(ast){
	re = returnRE(ast);
	return new rhs(re);
}

function returnRE(ast) {
	switch(ast.type) {
		case "literal":
			return ast.val;
		case "special":
			return "\\" + ast.val;
		case "range":
			return ast.from + "-" + ast.to;
		case ".":
			return returnRE(ast.arg1) + returnRE(ast.arg2);
			break;
		case "|":
			return "(" + returnRE(ast.arg1) + ")|(" + returnRE(ast.arg2) +")";
			break;
		case "+":
		case "*":
		case "?":
			return returnRE(ast.arg) + ast.type;
		case "group":
			return "(" + returnRE(ast.group) + ")";
		case "repeat":
			if (ast.hasOwnProperty("exactly")) {
				return returnRE(ast.arg) + "{" + ast.exactly + "}";
			}
			else {
				if (ast.to === "infinity") {
					return returnRE(ast.arg) +"{" + ast.from + ",}";
				}
				else {
					return returnRE(ast.arg) +"{" + ast.from + "," + ast.to + "}";
				}
			}
		case "set":
			var g = ast.set.map(returnRE).join("");
			return "[" + g + "]";
		case "not-set":
			var g = ast.set.map(returnRE).join("");
			return "[^" + g + "]";
		default:
			throw Error("Unhandled AST node in ASTtoRE()");
	}
}

/* rhs.compose allows rhs to support new function composition. It returns a new function that
 * maps input arguments to functions one-to-one and is to be read left from right.
 * An example usage would be:
 * var func1 = rhs.compose(rhs.repeat)(rhs.concat)(rhs.alter)(rhs.pivot)();
 * var result = func1("a", 4, "fgh", "e", ".")
 * where the resulting regular expression is: /((a){4}fgh)|(e).((a){4}fgh)|(e)/
 * */
rhs.compose = function compose(f) {
        var queue = f ? [f] : [];
        var fn = function fn(g) {
            if (arguments.length) {
                queue.push(g);
                return fn;
        }
        return function() {
            var args = Array.prototype.slice.call(arguments);
            var re = new rhs(args[0])
            for (var i = 0; i < queue.length; i++) {
                re = queue[i].apply(re, [args[i+1]]);
              }
            return re
        }
    };
    return fn;
};

// Allows users to import rhs code
if (typeof(module)!== 'undefined') {
	module.exports = {
		rhs: rhs
	};
}
