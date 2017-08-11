[![Build Status](https://travis-ci.org/simpleviewinc/fastextend.svg?branch=master)](https://travis-ci.org/simpleviewinc/fastextend)

# fastextend

Fast recursive object and array clone and merge focused on literal js types. Optimized for v8.

`npm install fastextend`

This module is aimed at solving two common use-cases, deep cloning objects/arrays and merging objects and arrays. Many of the current modules suffer from v8 deopts or wonky behaviors regarding arrays, undefined and nested non-literal objects.

Careful work is taken on the internals in order to make sure that we are staying monomorphic and avoiding v8 de-opts according to some of the work by Vyacheslav Egorov. See [What's up with monomorphism](http://mrale.ph/blog/2015/01/11/whats-up-with-monomorphism.html) for more info. This allows us to get 3x to 10x performance over common libraries methods `lodash`, `fast-clone`, `extend` or `JSON.parse(JSON.stringify(obj))`.

Right now `fastextend` only works on simple javascript natives, the kind that JSON supports, because attempting to extend/clone non-literal objects is a minefield and causes almost every deep-extend module to have unsolvable edgecases.

cloneable values: {}, [], string, number, boolean, null, undefined.

# benchmark

Run the benchmark via `npm run simplebench`.

As of 8/11/2017 on Node 7.10.1, higher ops/sec is better.

```js
Group:  default
Winner - fastextend.clone

fastextend.clone - count: 176450, ops/sec: 176450
JSON dance - count: 60164, ops/sec: 60164, diff: -65.90%
extend - count: 37990, ops/sec: 37990, diff: -78.47%
fast-clone - count: 29268, ops/sec: 29268, diff: -83.41%
lodash.cloneDeep - count: 18203, ops/sec: 18203, diff: -89.68%
```

# Getting Started

```js
// clone an object
var obj = fastextend.clone({ foo : "fooValue" });

// merge multiple objects
var obj = fastextend.merge({}, { foo : "fooValue" }, { bar : "barValue" });

// deep clone arrays of objects, all nested objects and arrays are cloned
var arr = fastextend.clone([
	{ foo : "fooValue" },
	{ foo : "fooValue2" },
	{ foo : "fooValue3", arr2 : [1,2,3] }
]);

// customize behavior
var obj = fastextend.mergeWithOptions({ foo : [{ foo : "fooValue" }] }, { foo : [{ bar : "barValue" }] }, { mergeArrays : false });
```

## fastextend.clone(obj)

Deep clones an object or an array. The object/array must only contain clonable values. Non-clonable values such as non-literal Objects, Dates or functions will throw.

This is just a shortcut for `fastextend.merge({}, obj)` or `fastextend.merge([], arr)`.

```js
// deep clones the object to foo
var foo = fastextend.clone({ key : 1, nested : { more : { key2 : true } } });

// deep clones an array of objects, all arrays and objects are cloned
var foo = fastextend.clone([{ foo : 1 }, { foo : 2 }, { foo : 3 }]);
```

## fastextend.merge(target, arg1, arg2, argN);

Clones of each argument are merged into the target object.

### Caveats

1. You can pass as many objects/arrays and will merge them left to right into the first argument. Nothing but the first argument are modified.
1. A key with `undefined` value will overwrite a key with a value. If the key exists it merges.
1. If the merging key contains an array or object and the target key is neither, it will be overwritten. If the target key matches the type, the subkeys are merged in.
1. Merging arrays overwrites by key. So `fastextend.merge([1,2], [5,2,3], [4]) === [4,2,3]`.
1. If merge-key is not clonable, it will throw.

### Examples

```js
// merging arrays of objects
fastextend.merge([
	{ id : 1, categories : [{ catid : 1 }] }
], [
	{ categories : [{ added : 1 }] }
])
// result
[
	{ id : 1, categories : [{ catid : 1, added : 1 }] }
]

// merge undefined overwriting key with value
fastextend.merge({ foo : "fooValue" }, { foo : undefined })
// result
{ foo : undefined }
```

## fastextend.mergeWithOptions(target, arg1, arg2, argN, options);

Merge but with the last argument being `options`.

1. `options.mergeUndefined` - Default `true`. If true, merges will copy undefined values right to left. So an undefined value will overwrite a value. If set to false, undefined values will not merge.
1. `options.mergeArrays` - Default `true`. If true, it will recurse into arrays and merge keys into those arrays. If false, it treats arrays as simple key, and will only deep clone the right key, but will not merge entries with the left key. In some cases it is desirable that if an array exists in the right key that it simply replaces the array on the left, rather than blends. Setting this to false will accomplish that.

```js
fastextend.mergeWithOptions({ foo : "fooValue" }, { foo : undefined }, { bar : undefined }, { baz : null }, { mergeUndefined : false });
// result
{ foo : "fooValue", baz : null }

fastextend.merge({ foo : "fooValue" }, { foo : undefined }, { bar : undefined }, { baz : null });
{ foo : undefined, bar : undefined, baz : null }

fastextend.mergeWithOptions({ foo : [{ bar : 1 }, { bar : 2 }] }, { foo : [{ baz : 1 }] }, { mergeArrays : false });
{ foo : [{ baz : 1 }] }

fastextend.merge({ foo : [{ bar : 1 }, { bar : 2 }] }, { foo : [{ baz : 1 }] });
{ foo : [{ bar : 1, baz : 1 }, { bar : 2 }] }
```