var extend = require("extend");
var fastextend = require("../index.js");
var fastclone = require("fast-clone");
var lodash = require("lodash");

var obj = {
	str : "string",
	num : 50,
	bool : true,
	test : null,
	something : undefined,
	arr : ["string", 50, true, null, undefined],
	arr2 : [
		{
			key : "1"
		},
		{
			key : "2"
		},
		{
			key : "3"
		},
		{
			key : "4"
		}
	],
	nested : {
		foo : {
			bar : {
				baz : {
					another : true
				}
			}
		}
	}
}

suite.add("extend", function(done) {
	var test = extend(true, {}, obj);
	return done();
});

suite.add("fastextend.clone", function(done) {
	var test = fastextend.clone(obj);
	return done();
});

suite.add("fast-clone", function(done) {
	var test = fastclone(obj);
	return done();
});

suite.add("lodash.cloneDeep", function(done) {
	var test = lodash.cloneDeep(obj);
	return done();
});

suite.add("JSON dance", function(done) {
	var test = JSON.parse(JSON.stringify(obj));
	return done();
});