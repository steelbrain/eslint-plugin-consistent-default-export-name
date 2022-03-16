/**
 * @author Chiawen Chen (github: @golopot)
 */

const isStaticRequire = require('../common/isStaticRequire');
const Path = require('path');

/**
 * @param {string} filename
 * @returns {string}
 */
function removeExtension(filename) {
    return Path.basename(filename, Path.extname(filename));
}

/**
 * @param {string} filename
 * @returns {string}
 */
function normalizeFilename(filename) {
    return filename.replace(/[-_.]/g, '').toLowerCase();
}

/**
 * Test if local name matches filename.
 * @param {string} localName
 * @param {string} filename
 * @returns {boolean}
 */
function isCompatible(localName, filename) {
    const normalizedLocalName = localName.replace(/_/g, '').toLowerCase();

    return (
        normalizedLocalName === normalizeFilename(filename) ||
        normalizedLocalName === normalizeFilename(removeExtension(filename))
    );
}

/**
 * Match 'foo' and '@foo/bar' but not 'foo/bar.js', './foo', or '@foo/bar/a.js'
 * @param {string} path
 * @returns {boolean}
 */
function isBarePackageImport(path) {
    return (
        (path !== '.' &&
            path !== '..' &&
            !path.includes('/') &&
            !path.startsWith('@')) ||
        /@[^/]+\/[^/]+$/.test(path)
    );
}

/**
 * Match paths consisting of only '.' and '..', like '.', './', '..', '../..'.
 * @param {string} path
 * @returns {boolean}
 */
function isAncestorRelativePath(path) {
    return (
        path.length > 0 &&
        !path.startsWith('/') &&
        path
            .split(/[/\\]/)
            .every(
                (segment) =>
                    segment === '..' || segment === '.' || segment === ''
            )
    );
}

/**
 * @param {string} packageJsonPath
 * @returns {string | undefined}
 */
function getPackageJsonName(packageJsonPath) {
    try {
        return require(packageJsonPath).name || undefined;
    } catch (_) {
        return undefined;
    }
}

function getNameFromPackageJsonOrDirname(path, context) {
    const directoryName = Path.join(context.getFilename(), path, '..');
    const packageJsonPath = Path.join(directoryName, 'package.json');
    const packageJsonName = getPackageJsonName(packageJsonPath);
    return packageJsonName || Path.basename(directoryName);
}

/**
 * Get filename from a path.
 * @param {string} path
 * @param {object} context
 * @returns {string | undefined}
 */
function getFilename(path, context) {
    // like require('lodash')
    if (isBarePackageImport(path)) {
        return undefined;
    }

    const basename = Path.basename(path);

    const isDir = /^index$|^index\./.test(basename);
    const processedPath = isDir ? Path.dirname(path) : path;

    // like require('.'), require('..'), require('../..')
    if (isAncestorRelativePath(processedPath)) {
        return getNameFromPackageJsonOrDirname(processedPath, context);
    }

    return Path.basename(processedPath) + (isDir ? '/' : '');
}

module.exports = {
    meta: {
        type: 'suggestion',
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    ignorePaths: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
            },
        ],
    },

    create(context) {
        return {
            ImportDeclaration(node) {
                const defaultImportSpecifier = node.specifiers.find(
                    ({ type }) => type === 'ImportDefaultSpecifier'
                );

                const defaultImportName =
                    defaultImportSpecifier && defaultImportSpecifier.local.name;

                if (!defaultImportName) {
                    return;
                }

                const filename = getFilename(node.source.value, context);

                if (!filename) {
                    return;
                }

                if (!isCompatible(defaultImportName, filename)) {
                    context.report({
                        node: defaultImportSpecifier,
                        message: `Default import name does not match filename "${filename}".`,
                    });
                }
            },

            CallExpression(node) {
                if (
                    !isStaticRequire(node) ||
                    node.parent.type !== 'VariableDeclarator' ||
                    node.parent.id.type !== 'Identifier'
                ) {
                    return;
                }

                const localName = node.parent.id.name;

                const filename = getFilename(node.arguments[0].value, context);

                if (!filename) {
                    return;
                }

                if (!isCompatible(localName, filename)) {
                    context.report({
                        node: node.parent.id,
                        message: `Default import name does not match filename "${filename}".`,
                    });
                }
            },
        };
    },
};
