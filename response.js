'use strict';

const striptags = require('striptags');
const assert = require('chai').assert;
const _ = require('underscore');
const fuzzy = require('fuzzyset.js');

function initResponse(test, conversationApi, ssml) {
  const type = ssml ? 'ssml' : 'plain text';
  const FUZZY_MIN_SCORE = 0.85; // minimum distance to match strings

  // Private

  function processActual(actual) {
    if (type !== 'ssml') return striptags(actual);
    return actual;
  }

  // public

  const responseApi = {
    shouldEqual: (expected, reprompt) => shouldEqual(true, expected, reprompt),
    shouldNotEqual: (expected, reprompt) => shouldEqual(false, expected, reprompt),
    shouldContain: (expected, reprompt) => shouldContain(true, expected, reprompt),
    shouldNotContain: (expected, reprompt) => shouldContain(false, expected, reprompt),
    shouldApproximate: (expected, reprompt, fuzzyScoreOverride) => shouldApproximate(true, expected, reprompt, fuzzyScoreOverride),
    shouldNotApproximate: (expected, reprompt, fuzzyScoreOverride) => shouldApproximate(false, expected, reprompt, fuzzyScoreOverride)
  };

  function api() {
    return _.extend(conversationApi, responseApi);
  }

  function not(b) {
    return b ? '' : 'not ';
  }

  function paramPassed(param) {
    return !(_.isNull(param) || _.isUndefined(param));
  }

  function shouldFuzzyMatch(shouldOrNot, actual, expectedSet, minFuzzyScore) {
    const match = expectedSet.get(actual);
    let res = {fuzzyMatch: false, score: null};
    if (match && match[0][0]) {
      res.score = match[0][0];
      if (match[0][0] >= minFuzzyScore) {
        res.fuzzyMatch = true;
      }
    }
    return shouldOrNot ? res : {fuzzyMatch: !res.fuzzyMatch, score: res.score};
  }

  // used to build public function

  function shouldEqual(shouldOrNot, expected, expectedReprompt) {
    test.checks.push(testCase => {
      if (paramPassed(expected)) {
        const actual = processActual(testCase.actual.response.outputSpeech.ssml);
        it(`Alexa's ${type} response should ${not(shouldOrNot)}equal: ${expected}`, () =>
          shouldOrNot ? assert.equal(actual, expected) : assert.notEqual(actual, expected)
        );
      }
      if (paramPassed(expectedReprompt)) {
        const actualReprompt = processActual(testCase.actual.response.reprompt.outputSpeech.ssml);
        it(`Alexa's ${type} reprompt should ${not(shouldOrNot)}equal: ${expectedReprompt}`, () =>
          shouldOrNot ? assert.equal(actualReprompt, expectedReprompt) : assert.notEqual(actualReprompt, expectedReprompt)
        );
      }
    });
    return api(); // response.shouldEqual(...).shouldContain(...).{something}
  }

  function shouldContain(shouldOrNot, expected, expectedReprompt) {
    test.checks.push(testCase => {
      if (paramPassed(expected)) {
        const actual = processActual(testCase.actual.response.outputSpeech.ssml);
        it(`Alexa's ${type} response should ${not(shouldOrNot)}contain: ${expected}`, () =>
          shouldOrNot ? assert.include(actual, expected) : assert.notInclude(actual, expected)
        );
      }
      if (paramPassed(expectedReprompt)) {
        const actualReprompt = processActual(testCase.actual.response.reprompt.outputSpeech.ssml);
        it(`Alexa's ${type} reprompt should ${not(shouldOrNot)}contain: ${expectedReprompt}`, () =>
          shouldOrNot ? assert.include(actualReprompt, expectedReprompt) : assert.notInclude(actualReprompt, expectedReprompt)
        );
      }
    });
    return api();
  }

  function shouldApproximate(shouldOrNot, expected, expectedReprompt, fuzzyScoreOverride) {
    const minFuzzyScore = (typeof fuzzyScoreOverride === 'undefined') ? FUZZY_MIN_SCORE : fuzzyScoreOverride;
    test.checks.push(testCase => {
      if (paramPassed(expected)) {
        const expectedFuzzy = fuzzy([expected]);
        const actual = processActual(testCase.actual.response.outputSpeech.ssml);
        it(`Alexa's ${type} response should ${not(shouldOrNot)}approximate (min. fuzzy match score: ${minFuzzyScore}): ${expected}`, () => {
          const {fuzzyMatch, score} = shouldFuzzyMatch(shouldOrNot, actual, expectedFuzzy, minFuzzyScore);
          assert(
            fuzzyMatch,
            `Actual is similar to expected with a score over ${minFuzzyScore}\n\nActual:\n\n  ${actual}\n\nFuzzy Expected:\n\n  ${expected}\n\nActual Fuzzy Score:\n\n  ${score}`
          );
        });
      }
      if (paramPassed(expectedReprompt)) {
        const repromptFuzzy = fuzzy([expectedReprompt]);
        const actualReprompt = processActual(testCase.actual.response.reprompt.outputSpeech.ssml);
        it(`Alexa's ${type} reprompt should ${not(shouldOrNot)}approximate (min. fuzzy match score: ${minFuzzyScore}): ${expected}`, () => {
          const {fuzzyMatch, score} = shouldFuzzyMatch(shouldOrNot, actualReprompt, repromptFuzzy, minFuzzyScore);
          assert(
            fuzzyMatch,
            `Actual is similar to expected with a score over ${minFuzzyScore}\n\nActual:\n\n  ${actualReprompt}\n\nFuzzy Expected:\n\n  ${expectedReprompt}\n\nActual Fuzzy Score:\n\n  ${score}`
          );
        });
      }
    });
    return api(); // response.shouldEqual(...).shouldContain(...).{something}
  }

  return responseApi; // response.{something}
}

module.exports = {
  plain: (test, conversationApi) => initResponse(test, conversationApi, false),
  ssml: (test, conversationApi) => initResponse(test, conversationApi, true)
};
