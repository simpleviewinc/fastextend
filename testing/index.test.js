var fastextend = require("../index.js");
var lodash = require("lodash");
var assert = require("assert");

describe(__filename, function() {
	var tests = [
		{
			name : "simple",
			args : [{}, { str : "string", num : 5, bool : true, undefined : undefined, null : null }],
			result : { str : "string", num : 5, bool : true, undefined : undefined, null : null }
		},
		{
			name : "multiple objects simple",
			args : [{}, { str : "bogus" }, { str : "valid" }],
			result : { str : "valid" }
		},
		{
			name : "nested",
			args : [{}, { foo : { bar : { baz : { nested : true } } } }],
			result : { foo : { bar : { baz : { nested : true } } } }
		},
		{
			name : "arrays",
			args : [[], [1,2], [3,4]],
			result : [3,4]
		},
		{
			name : "merge",
			args : [{ foo : "foo", undefined : "foo" }, { bar : "bar", undefined : undefined }],
			result : { foo : "foo", bar : "bar", undefined : undefined }
		},
		{
			name : "deepMerge",
			args : [{ foo : { bar : { baz : { nested : true } } } }, { foo : { bar : { baz : { newKey : "value" } } } }],
			result : { foo : { bar : { baz : { nested : true, newKey : "value" } } } },
			checkNotEqual : [
				[1, "foo"],
				[1, "foo.bar"],
				[1, "foo.bar.baz"]
			]
		},
		{
			name : "key overwrite",
			args : [{ foo : { test : "yes" } }, { foo : true }],
			result : { foo : true }
		},
		{
			name : "object array merge",
			args : [{ foo : [1, { foo : "fooValue" }] }, { foo : [1, { bar : "barValue" }] }],
			result : { foo : [1, { foo : "fooValue", bar : "barValue" }] },
			checkNotEqual : [
				[1, "foo.1"]
			]
		},
		{
			name : "object array replace with simple",
			args : [{ foo : [1, { foo : "fooValue" }] }, { foo : [1, 2] }],
			result : { foo : [1, 2] },
			checkNotEqual : [
				[1, "foo"]
			]
		},
		{
			name : "object array replace with object",
			args : [{ foo : [1, 2] }, { foo : [{ foo : "fooValue" }] }],
			result : { foo : [{ foo : "fooValue" }, 2] },
			checkNotEqual : [
				[1, "foo"],
				[1, "foo.0"]
			]
		},
		{
			name : "object replace with array",
			args : [{ foo : { bar : "barValue" } }, { foo : [{ baz : "bazValue" }] }],
			result : { foo : [{ baz : "bazValue" }] },
			checkNotEqual : [
				[1, "foo"]
			]
		},
		{
			name : "not execute defineProperty getter",
			args : [{}, (function() {
				var temp = { foo : "fooValue" };
				Object.defineProperty(temp, "bar", { get : () => "barValue" });
				return temp;
			})()],
			result : { foo : "fooValue" }
		},
		{
			name : "should execute inline getter",
			args : [{}, { foo : "fooValue", get bar() { return "barValue" } }],
			result : { foo : "fooValue", bar : "barValue" }
		},
		{
			name : "should fail on non-standard prototype",
			args : [{}, (function() {
				var Temp = function() {};
				var temp = new Temp();
				temp.bar = "barValue";
				return { temp : temp };
			})()],
			error : "fastextend only supports string, number, boolean, undefined, null and object/array literals, got 'Temp'."
		},
		{
			name : "fail if root mismatch object to array",
			args : [{}, []],
			error : "Root arguments must both be array literals or object literals."
		},
		{
			name : "fail if root mismatch array to object",
			args : [[], {}],
			error : "Root arguments must both be array literals or object literals."
		},
		{
			name : "fail if root mistmatch object to boolean",
			args : [{}, true],
			error : "Root arguments must both be array literals or object literals."
		},
		{
			name : "multiple nested blending",
			args : [{ foo : "fooValue" }, { bar : { second : true } }, { bar : { third : true } }],
			result : { foo : "fooValue", bar : { second : true, third : true } },
			checkNotEqual : [
				[1, "bar"],
				[2, "bar"]
			]
		},
		{
			name : "should not-fail on merge-target with non-literal objects",
			args : [{ foo : new Date(2015, 1, 1) }, { bar : "barValue" }],
			result : { foo : new Date(2015, 1, 1), bar : "barValue" }
		},
		{
			name : "should fail on nested date",
			args : [{}, { foo : new Date(2015, 1, 1) }],
			error : "fastextend only supports string, number, boolean, undefined, null and object/array literals, got 'Date'."
		},
		{
			name : "should clone objects",
			args : [{ foo : "fooValue", nested : { arr : [1,2], key : { foo : "fooValue" } } }],
			method : "clone",
			result : { foo : "fooValue", nested : { arr : [1,2], key : { foo : "fooValue" } } },
			checkNotEqual : [
				[0, "nested"],
				[0, "nested.arr"],
				[0, "nested.key"]
			]
		},
		{
			name : "mergeWithOptions mergeUndefined === true",
			args : [{ foo : "fooValue" }, { foo : undefined }, { bar : undefined }, { baz : null }],
			result : { foo : undefined, bar : undefined, baz : null }
		},
		{
			name : "mergeWithOptions mergeUndefined === false",
			args : [{ foo : "fooValue" }, { foo : undefined }, { bar : undefined }, { baz : null }, { mergeUndefined : false }],
			method : "mergeWithOptions",
			result : { foo : "fooValue", baz : null }
		},
		{
			name : "mergeWithOptions mergeArrays === true",
			args : [{ foo : [{ foo : "fooValue" }, 2] }, { foo : [{ bar : "barValue" }] }],
			result : { foo : [{ foo : "fooValue", bar : "barValue" }, 2] }
		},
		{
			name : "mergeWithOptions mergeArrays === false",
			args : [{ foo : [{ foo : "fooValue" }, 2] }, { foo : [{ bar : "barValue" }] }, { mergeArrays : false }],
			method : "mergeWithOptions",
			result : { foo : [{ bar : "barValue" }] }
		}
	]
	
	tests.forEach(function(test) {
		it(test.name, function(done) {
			var methodName = test.method || "merge";
			var method = fastextend[methodName];
			
			try {
				var result = method(...test.args);
			} catch (e) {
				if (test.error !== undefined) {
					assert.strictEqual(e.message, test.error);
					return done();
				} else {
					assert.ifError(e);
				}
			}
			
			// ensure the returned result matches our expected result
			assert.deepStrictEqual(result, test.result);
			
			// ensure that our result is not just our original value by reference
			assert.notStrictEqual(result, test.result);
			
			// ensure that the first argument is the by-reference of our result
			if (methodName === "merge") {
				assert.strictEqual(result, test.args[0]);
			}
			
			if (test.checkNotEqual !== undefined) {
				test.checkNotEqual.forEach(function(val) {
					var left = lodash.get(result, val[1]);
					var right = lodash.get(test.args, val[0] + "." + val[1]);
					assert.notStrictEqual(left, right);
				});
			}
			
			return done();
		});
	});
});