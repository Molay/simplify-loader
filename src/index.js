import { getOptions } from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

/**
 * Remove comments.
 * Support two forms:
 * "\/\/..."
 * "\/*...*\/"
 */
const PATTERN_COMMENT = {
  test: /((["'])(?:\\[\s\S]|.)*?\2|\/(?![*\/])(?:\\.|\[(?:\\.|.)\]|.)*?\/)|\/\/.*?$|\/\*[\s\S]*?\*\//gm,
  replacement: '$1'
};

/**
 * Replace multiple whitespace characters that appear in succession with spaces.
 * Not include CRLF.
 */
const PATTERN_MULTIPLE_WHITESPACE = {
  test: /[ \f\t\v]+/g,
  replacement: ' '
};

/**
 * Remove whitespace characters at the beginning and end of the line.
 * Not include CRLF.
 */
const PATTERN_TRIM_WHITESPACE = {
  test: /^[ \f\t\v]+|[ \f\t\v]+$/gm,
  replacement: ''
};

/**
 * Remove multiple whitespace characters that appear consecutively at the beginning of the line.
 */
const PATTERN_HEAD_MULTIPLE_WHITESPACE_CRLF = {
  test: /^\s+/gm,
  replacement: ''
};

/**
 * Remove multiple whitespace characters that appear in expression.
 */
const PATTERN_EXPRESSION_WHITESPACE = {
  test: /\B[ \f\t\v]+\b|\b[ \f\t\v]+\B|\B[ \f\t\v]+\B/g,
  replacement: ''
};

/**
 * Remove CRLF characters.
 */
const PATTERN_CRLF = {
  test: /[\r\n]/g,
  replacement: ''
};

export default function simplifyLoader(source) {
  const options = getOptions(this) || {};

  validateOptions(schema, options, {
    name: 'Simplify Loader',
    baseDataPath: 'options',
  });

  let plaintext = source;
  let mapKIgnoredInfoVPlaceholder = {};

  // keep ignored info
  if (options.ignore) {
    const ignore = options.ignore;
    // generate unique placeholder prefix
    let placeholderPrefix;
    do {
      placeholderPrefix = `placeholder_${Math.round(Math.random() * 0xFFFFFFFF).toString(36)}`;
    }
    while (plaintext.indexOf(placeholderPrefix) !== -1);
    // make placeholders for each ignored info
    let id = 0;
    (Array.isArray(ignore) ? ignore : [ignore]).forEach(o => {
      if (o instanceof RegExp) {
        o.lastIndex = 0;
        const items = plaintext.match(o);
        if (items) items.forEach((item, index) => {
          if (mapKIgnoredInfoVPlaceholder[item]) return;
          mapKIgnoredInfoVPlaceholder[item] = `${placeholderPrefix}_${(id++).toString(36)}`;
        });
      }
      else if (typeof o === 'string') {
        if (mapKIgnoredInfoVPlaceholder[o]) return;
        mapKIgnoredInfoVPlaceholder[o] = `${placeholderPrefix}_${(id++).toString(36)}`;
      }
    });
    // replace ignored info with placeholders
    Object.entries(mapKIgnoredInfoVPlaceholder).forEach(([key, value]) => {
      plaintext = plaintext.replace(new RegExp(key, 'g'), value);
    });
  }

  if (options.comment != false)
    plaintext = plaintext.replace(PATTERN_COMMENT.test, PATTERN_COMMENT.replacement);
  if (options.whitespace != false)
    plaintext = plaintext.replace(PATTERN_MULTIPLE_WHITESPACE.test, PATTERN_MULTIPLE_WHITESPACE.replacement)
      .replace(PATTERN_TRIM_WHITESPACE.test, PATTERN_TRIM_WHITESPACE.replacement)
      .replace(PATTERN_HEAD_MULTIPLE_WHITESPACE_CRLF.test, PATTERN_HEAD_MULTIPLE_WHITESPACE_CRLF.replacement)
      .replace(PATTERN_EXPRESSION_WHITESPACE.test, PATTERN_EXPRESSION_WHITESPACE.replacement)
  if (options.crlf)
    plaintext = plaintext.replace(PATTERN_CRLF.test, PATTERN_CRLF.replacement)

  // revert ignored info from placeholders
  Object.entries(mapKIgnoredInfoVPlaceholder).forEach(([key, value]) => {
    plaintext = plaintext.replace(new RegExp(value, 'g'), key);
  });

  return plaintext;
}
