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