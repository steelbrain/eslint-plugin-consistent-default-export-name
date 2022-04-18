/**
 * @author Stefan Lau
 */

const camelCase = require('lodash/camelCase');
const upperFirst = require('lodash/upperFirst');
const kebabCase = require('lodash/kebabCase');
const snakeCase = require('lodash/snakeCase');

var path = require('path'),
    parseFilename = require('../common/parseFilename'),
    isIgnoredFilename = require('../common/isIgnoredFilename'),
    getExportedName = require('../common/getExportedName'),
    isIndexFile = require('../common/isIndexFile'),
    transforms = [
        kebabCase,
        snakeCase,
        camelCase,
        // Pascal case
        function (name) {
            return upperFirst(camelCase(name));
        },
    ];

function getStringToCheckAgainstExport(parsed, replacePattern) {
    var dirArray = parsed.dir.split(path.sep);
    var lastDirectory = dirArray[dirArray.length - 1];

    if (isIndexFile(parsed)) {
        return lastDirectory;
    } else {
        return replacePattern
            ? parsed.name.replace(replacePattern, '')
            : parsed.name;
    }
}

function transform(exportedName) {
    return transforms.map(function (t) {
        return t ? t(exportedName) : exportedName;
    });
}

function anyMatch(expectedExport, transformedNames) {
    return transformedNames.some(function (name) {
        return name === expectedExport;
    });
}

function getWhatToMatchMessage(transforms) {
    if (transforms.length === 1 && !transforms[0]) {
        return 'the exported name';
    }
    if (transforms.length > 1) {
        return 'any of the exported and transformed names';
    }
    return 'the exported and transformed name';
}

module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description:
                'If node contains default export, the filename should match the name of the defualt export',
            category: 'Possible Errors',
            recommended: true,
        },

        fixable: 'code',

        schema: [
            {
                type: ['string', 'null'],
            },
            {
                type: ['boolean', 'null'],
            },
        ], // no options
    },
    create: function (context) {
        return {
            Program: function (node) {
                var replacePattern = context.options[0]
                        ? new RegExp(context.options[0])
                        : null,
                    filename = context.getFilename(),
                    absoluteFilename = path.resolve(filename),
                    parsed = parseFilename(absoluteFilename),
                    shouldIgnore = isIgnoredFilename(filename),
                    exportedName = getExportedName(node, context.options),
                    isExporting = Boolean(exportedName),
                    expectedExport = getStringToCheckAgainstExport(
                        parsed,
                        replacePattern
                    ),
                    transformedNames = transform(exportedName),
                    everythingIsIndex =
                        exportedName === 'index' && parsed.name === 'index',
                    matchesExported =
                        anyMatch(expectedExport, transformedNames) ||
                        everythingIsIndex,
                    reportIf = function (
                        condition,
                        messageForNormalFile,
                        messageForIndexFile
                    ) {
                        var message = (
                            !messageForIndexFile || !isIndexFile(parsed)
                                ? messageForNormalFile
                                : messageForIndexFile
                        )
                            .replace('{{expectedExport}}', expectedExport)
                            .replace(
                                '{{whatToMatch}}',
                                getWhatToMatchMessage(transforms)
                            )
                            .replace(
                                '{{exportName}}',
                                transformedNames.join("', '")
                            );

                        if (condition) {
                            context.report({
                                loc: {
                                    start: { line: 1, column: 0 },
                                    end: { line: 2, column: 0 },
                                },
                                message,
                            });
                        }
                    };

                if (shouldIgnore) return;

                reportIf(
                    isExporting && !matchesExported,
                    "Filename '{{expectedExport}}' must match {{whatToMatch}}, instead of '{{exportName}}'.",
                    "The directory '{{expectedExport}}' must be named '{{exportName}}', after the exported value of its index file."
                );
            },
        };
    },
};
