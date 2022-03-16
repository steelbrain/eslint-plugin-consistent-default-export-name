# eslint-plugin-consistent-modules

Adds rules to help use consistent "default export" names throughout the project.

If both rules are activated, default names will be consistent overall.

## I DID NOT WRITE THE RULES

Forked from [@minseoksuh](https://github.com/minseoksuh/eslint-plugin-consistent-default-export-name)

- Thanks to @selaux who wrote the rule (filenames/match-exported) and made `eslint-plugin-filenames`
- Thanks to @golopot who wrote the rule and made PR to `eslint-plugin-import`

## Installation

```shell
npm install @steelbrain/consistent-modules --save-dev
```

```shell
yarn add -D @steelbrain/consistent-modules
```

## Rule Option & Documentation

- [default-export-match-filename](./docs/rules/default-export-match-filename.md)
- [default-import-match-filename](./docs/rules/default-import-match-filename.md)

## How To Use

1. either extend config which enables both rules

    ```json
    {
        "extends": ["plugin:@steelbrain/consistent-modules/recommended"]
    }
    ```

    which, sets below

    ```json
    {
        "rules": {
            "@steelbrain/consistent-modules/default-export-match-filename": "error",
            "@steelbrain/consistent-modules/default-import-match-filename": "error"
        }
    }
    ```

2. or set rules inidividually

    ```json
    {
        "rules": {
            "@steelbrain/consistent-modules/default-export-match-filename": "error",
        }
    }
    ```
