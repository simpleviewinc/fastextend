var clone = function(arg) {
	if (arg instanceof Array) {
		return merge([], arg);
	} else if (typeof arg === "object" && arg.constructor === Object) {
		return merge({}, arg);
	} else {
		throw new Error("Can only clone, objects or arrays literals.");
	}
}

var mergeWithOptions = function() {
	var args = [];
	for(var i = 1; i < arguments.length - 1; i++) {
		args[i - 1] = arguments[i];
	}
	
	var originalOptions = arguments[arguments.length - 1];
	var options = {
		mergeUndefined : originalOptions.mergeUndefined !== undefined ? originalOptions.mergeUndefined : true,
		mergeArrays : originalOptions.mergeArrays !== undefined ? originalOptions.mergeArrays : true
	}
	
	return _mergeTargets(arguments[0], args, options);
}

var merge = function() {
	var args = [];
	for(var i = 1; i < arguments.length; i++) {
		args[i - 1] = arguments[i];
	}
	
	return _mergeTargets(arguments[0], args, { mergeUndefined : true, mergeArrays : true });
}

var _mergeTargets = function(first, sources, options) {
	for(var i = 0; i < sources.length; i++) {
		if (first instanceof Array && sources[i] instanceof Array) {
			_mergeArray(first, sources[i], options);
		} else if (typeof first === "object" && first.constructor === Object && typeof sources[i] === "object" && sources[i].constructor === Object) {
			_mergeObject(first, sources[i], options);
		} else {
			throw new Error("Root arguments must both be array literals or object literals.");
		}
	}
	
	return first;
}

var _mergeArray = function(first, second, options) {
	for(var i = 0; i < second.length; i++) {
		var val = _mergeGetValue(first[i], second[i], options);
		if (val !== undefined || options.mergeUndefined === true) {
			first[i] = val;
		}
	}
	return first;
}

var _mergeObject = function(first, second, options) {
	for(var i in second) {
		var val = _mergeGetValue(first[i], second[i], options);
		if (val !== undefined || options.mergeUndefined === true) {
			first[i] = val;
		}
	}
	return first;
}

var _mergeGetValue = function(first, second, options) {
	if (typeof second !== "object") {
		return second;
	}
	
	if (second === null) {
		return second;
	} else if (second instanceof Array) {
		return _mergeArray(options.mergeArrays === true && first !== undefined && first instanceof Array ? first : [], second, options);
	} else if (second.constructor === Object) {
		return _mergeObject(first !== undefined && first.constructor === Object ? first : {}, second, options);
	} else {
		throw new Error("fastextend only supports string, number, boolean, undefined, null and object/array literals, got '" + second.constructor.name + "'.");
	}
}

module.exports = {
	clone : clone,
	merge : merge,
	mergeWithOptions : mergeWithOptions
}