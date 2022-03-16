/**
 * @fileoverview default-export-name = default-import-name = filename
 * @author minseoksuh
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const defaultExportMatchFilename = require('./rules/default-export-match-filename');
const defaultImportMatchFilename = require('./rules/default-import-match-filename');

module.exports = {
    configs: {
        recommended: {
            plugins: ['@steelbrain/consistent-modules'],
            env: {
                browser: true,
                es6: true,
                node: true,
            },
            rules: {
                '@steelbrain/consistent-modules/default-export-match-filename':
                    'error',
                '@steelbrain/consistent-modules/default-import-match-filename':
                    'error',
            },
        },
    },
    rules: {
        'default-export-match-filename': defaultExportMatchFilename,
        'default-import-match-filename': defaultImportMatchFilename,
    },
};
