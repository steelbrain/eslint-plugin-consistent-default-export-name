# @steelbrain/consistent-modules/default-export-match-filename (filenames/match-exported)

> @author Stefan Lau

Match the file name against the default exported value in the module. Files that dont have a default export will
be ignored. The exports of `index.js` are matched against their parent directory.

```js
// Considered problem only if the file isn't named foo.js or foo/index.js
export default function foo() {}

// Considered problem only if the file isn't named Foo.js or Foo/index.js
module.exports = class Foo() {}

// Considered problem only if the file isn't named someVariable.js or someVariable/index.js
module.exports = someVariable;

// Never considered a problem
export default { foo: "bar" };
```

If your filename policy doesn't quite match with your variable naming policy, you can add one or multiple transforms:

```json
"@steelbrain/consistent-modules/default-export-match-filename": [ 2, "kebab" ]
```

Now, in your code:

```js
// Considered problem only if file isn't named variable-name.js or variable-name/index.js
export default function variableName;
```

Available transforms:
'[snake](https://www.npmjs.com/package/lodash.snakecase)',
'[kebab](https://www.npmjs.com/package/lodash.kebabcase)',
'[camel](https://www.npmjs.com/package/lodash.camelcase)', and
'pascal' (camel-cased with first letter in upper case).

For multiple transforms simply specify an array like this (null in this case stands for no transform):

```json
"@steelbrain/consistent-modules/default-export-match-filename": [2, [ null, "kebab", "snake" ] ]
```

If you prefer to use suffixes for your files (e.g. `Foo.react.js` for a React component file),
you can use a second configuration parameter. It allows you to remove parts of a filename matching a regex pattern
before transforming and matching against the export.

```json
"@steelbrain/consistent-modules/default-export-match-filename": [ 2, null, "\\.react$" ]
```

Now, in your code:

```js
// Considered problem only if file isn't named variableName.react.js, variableName.js or variableName/index.js
export default function variableName;
```

If you also want to match exported function calls you can use the third option (a boolean flag).

```json
"@steelbrain/consistent-modules/default-export-match-filename": [ 2, null, null, true ]
```

Now, in your code:

```js
// Considered problem only if file isn't named functionName.js or functionName/index.js
export default functionName();
```
