/**
 * @file sanitization.js
 * @brief This file contains basic input sanitization configurations.
 *
 * Disclaimer: I don't think blacklists are a good solution for input
 * sanitization and validation, however issue #95 on
 * github.com/ian-james/ifs claims that Guelph Security does want to
 * allow the input of semicolons and slashes. This module is a configurable
 * solution to building blacklists of characters and validating strings.
 **/
var validator = require('validator');

// for each option: true adds sets of characters to blacklist;
// setting the categories: brackets, operators, punct, special to true will
// blacklist large sets of characters.
var default_options = {
    all: false,
    // quotes category
    quotes: false,
    // brackets category
    brackets: false, // disables below
    curly_brackets: false,
    round_brackets: true,
    square_brackets: false,
    // operators category
    operators: false, // disables below
    pluses: false,
    wildcards: true,
    // dashes category
    dashes: false,
    // punctuation category
    punct: false, // disables below
    underscores: false,
    semicolons: true,
    colons: false,
    dots: false,
    commas: false,
    questions: false,
    bangs: false,
    // special chars category
    special: false, // disables below
    pound: false,
    at_sign: false,
    caret: false,
    dollar: false,
    backslashes: false,
    slashes: false,
    pipes: false
};

function mergeOptions(obj1, obj2) {
    if (!obj2)
        obj2 = {};
    for (var key in obj1) {
        if (typeof(obj2[key]) === 'undefined') {
            obj2[key] = obj1[key];
        }
    }
    return obj2;
}

/**
 * Function to build a blacklist of potentially dangerous or illegal characters
 * @param options: JSON object of boolean switches
 * @see default_options
 * @return Escaped string used for a regular expression in containsIllegal().
 **/
function buildBlacklist(options) {
    var blacklist = '';

    // quotes
    if (options['all'] || options['quotes'])
        blacklist += '"' + "'";
    // brackets
    if (options['all'] || options['brackets'] || options['curly_brackets'])
        blacklist += '\\{\\}';
    if (options['all'] || options['brackets'] || options['round_brackets'])
        blacklist += '\\(\\)';
    if (options['all'] || options['brackets'] || options['square_brackets'])
        blacklist += '\\[\\]';
    // operators
    if (options['all'] || options['operators'] || options['pluses'])
        blacklist += '\\+';
    if (options['all'] || options['operators'] || options['wildcards'])
        blacklist += '\\*';
    // dashes category
    if (options['all'] || options['dashes'])
        blacklist += '-';
    // punct
    if (options['all'] || options['punct'] || options['underscores'])
        blacklist += '_';
    if (options['all'] || options['punct'] || options['semicolons'])
        blacklist += ';';
    if (options['all'] || options['punct'] || options['colons'])
        blacklist += ':';
    if (options['all'] || options['punct'] || options['dots'])
        blacklist += '\\.';
    if (options['all'] || options['punct'] || options['commas'])
        blacklist += ',';
    if (options['all'] || options['punct'] || options['questions'])
        blacklist += '\\?';
    if (options['all'] || options['punct'] || options['bangs'])
        blacklist += '!';
    // special chars
    if (options['all'] || options['special'] || options['pound'])
        blacklist += '#';
    if (options['all'] || options['special'] || options['at_sign'])
        blacklist += '@';
    if (options['all'] || options['special'] || options['dollar'])
        blacklist += '\\$';
    if (options['all'] || options['special'] || options['caret'])
        blacklist += '\\^'
    if (options['all'] || options['special'] || options['dollar'])
        blacklist += '\\$'
    if (options['all'] || options['special'] || options['backslashes'])
        blacklist += '\\\\';
    if (options['all'] || options['special'] || options['slashes'])
        blacklist += '\\/';
    if (options['all'] || options['special'] || options['pipes'])
        blacklist += '\\|';

    return blacklist;
}

/**
 * Function to test if a str contains illegal characters.
 * @return true if illegal characters present; false otherwise
 **/
function containsIllegal(str, options) {
    options = mergeOptions(default_options, options);
    var blacklist = buildBlacklist(options);

    var sanitized_str = validator.trim(validator.stripLow(str));
    sanitized_str = validator.blacklist(sanitized_str, blacklist);
    // if original input is equal to the sanitized input, it did not contain
    // any illegal characters
    if (validator.equals(str, sanitized_str)) {
        return false;
    }
    // else return true, since strings not equal and illegal chars present
    return true;
}

module.exports.default_options = default_options;
module.exports.containsIllegal = containsIllegal;
