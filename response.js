'use strict';

const striptags = require('striptags');
const assert = require('chai').assert;
const _ = require('underscore');
const fuzzy = require('fuzzyset.js');

function initResponse(test, conversationApi, fixSpaces, fuzzyDefault, isSsml) {
  const type = isSsml ? 'ssml' : 'plain text';
  const FUZZY_MIN_SCORE = _.isUndefined(fuzzyDefault) ? 0.93 : fuzzyDefault; // minimum distance to match strings
  const fixSpacesRegex = /(^[ ]{1,})|( )(?=[.,;!()/])|([ ]{1,}$)|[ ]{1,}(?= )/g;

  // Private

  function processActual(actual) {
    if (type !== 'ssml') actual = striptags(actual);
    if (fixSpaces) {
      return actual.replace(fixSpacesRegex, '');
    }
    return actual;
  }

  // public

  const responseApi = {
    shouldEqual: (expected, reprompt) => shouldEqual(true, expected, reprompt),
    shouldNotEqual: (expected, reprompt) => shouldEqual(false, expected, reprompt),
    shouldContain: (expected, reprompt) => shouldContain(true, expected, reprompt),
    shouldNotContain: (expected, reprompt) => shouldContain(false, expected, reprompt),
    shouldApproximate: (expected, reprompt, fuzzyScoreOverride) => shouldApproximate(true, expected, reprompt, fuzzyScoreOverride),
    shouldNotApproximate: (expected, reprompt, fuzzyScoreOverride) => shouldApproximate(false, expected, reprompt, fuzzyScoreOverride),
    shouldMatch: (regex, regexReprompt) => shouldMatch(true, regex, regexReprompt),
    shouldNotMatch: (regex, regexReprompt) => shouldMatch(false, regex, regexReprompt)
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
    const res = {fuzzyMatch: false, score: null};
    if (match && match[0][0]) {
      res.score = match[0][0];
      if (match[0][0] >= minFuzzyScore) {
        res.fuzzyMatch = true;
      }
    }
    return shouldOrNot ? res : {fuzzyMatch: !res.fuzzyMatch, score: res.score};
  }

  function getActuals(testCase) {
    let speech = '';
    let reprompt = '';

    if (testCase.actual.response) {
      if (testCase.actual.response.outputSpeech.ssml) {
        speech = processActual(testCase.actual.response.outputSpeech.ssml);
      }
      if (testCase.actual.response.reprompt && testCase.actual.response.reprompt.outputSpeech.ssml) {
        reprompt = processActual(testCase.actual.response.reprompt.outputSpeech.ssml);
      }
    }

    return {speech, reprompt};
  }

  // used to build public function

  function shouldEqual(shouldOrNot, expected, expectedReprompt) {
    test.checks.push(testCase => {
      const actuals = getActuals(testCase);
      if (paramPassed(expected)) {
        it(`Alexa's ${type} response should ${not(shouldOrNot)}equal: ${expected}`, () =>
          shouldOrNot ? assert.equal(actuals.speech, expected) : assert.notEqual(actuals.speech, expected)
        );
      }
      if (paramPassed(expectedReprompt)) {
        it(`Alexa's ${type} reprompt should ${not(shouldOrNot)}equal: ${expectedReprompt}`, () =>
          shouldOrNot ? assert.equal(actuals.reprompt, expectedReprompt) : assert.notEqual(actuals.reprompt, expectedReprompt)
        );
      }
    });
    return api(); // response.shouldEqual(...).shouldContain(...).{something}
  }

  function shouldContain(shouldOrNot, expected, expectedReprompt) {
    test.checks.push(testCase => {
      const actuals = getActuals(testCase);
      if (paramPassed(expected)) {
        it(`Alexa's ${type} response should ${not(shouldOrNot)}contain: ${expected}`, () =>
          shouldOrNot ? assert.include(actuals.speech, expected) : assert.notInclude(actuals.speech, expected)
        );
      }
      if (paramPassed(expectedReprompt)) {
        it(`Alexa's ${type} reprompt should ${not(shouldOrNot)}contain: ${expectedReprompt}`, () =>
          shouldOrNot ? assert.include(actuals.reprompt, expectedReprompt) : assert.notInclude(actuals.reprompt, expectedReprompt)
        );
      }
    });
    return api();
  }

  function shouldMatch(shouldOrNot, regex, regexReprompt) {
    test.checks.push(testCase => {
      const actuals = getActuals(testCase);
      if (paramPassed(regex)) {
        it(`Alexa's ${type} response should ${not(shouldOrNot)}match: ${regex}`, () =>
          shouldOrNot ? assert.match(actuals.speech, regex) : assert.notMatch(actuals.speech, regex)
        );
      }
      if (paramPassed(regexReprompt)) {
        it(`Alexa's ${type} reprompt should ${not(shouldOrNot)}match: ${regexReprompt}`, () =>
          shouldOrNot ? assert.match(actuals.reprompt, regexReprompt) : assert.notMatch(actuals.reprompt, regexReprompt)
        );
      }
    });
    return api();
  }

  function shouldApproximate(shouldOrNot, expected, expectedReprompt, fuzzyScoreOverride) {
    const minFuzzyScore = (typeof fuzzyScoreOverride === 'undefined') ? FUZZY_MIN_SCORE : fuzzyScoreOverride;
    test.checks.push(testCase => {
      const actuals = getActuals(testCase);
      if (paramPassed(expected)) {
        const expectedFuzzy = fuzzy([expected]);
        it(`Alexa's ${type} response should ${not(shouldOrNot)}approximate (min. fuzzy match score: ${minFuzzyScore}): ${expected}`, () => {
          const {fuzzyMatch, score} = shouldFuzzyMatch(shouldOrNot, actuals.speech, expectedFuzzy, minFuzzyScore);
          assert(
            fuzzyMatch,
            `Actual is similar to expected with a score over ${minFuzzyScore}\n\nActual:\n\n  ${actuals.speech}\n\nFuzzy Expected:\n\n  ${expected}\n\nActual Fuzzy Score:\n\n  ${score}`
          );
        });
      }
      if (paramPassed(expectedReprompt)) {
        const repromptFuzzy = fuzzy([expectedReprompt]);
        it(`Alexa's ${type} reprompt should ${not(shouldOrNot)}approximate (min. fuzzy match score: ${minFuzzyScore}): ${expected}`, () => {
          const {fuzzyMatch, score} = shouldFuzzyMatch(shouldOrNot, actuals.reprompt, repromptFuzzy, minFuzzyScore);
          assert(
            fuzzyMatch,
            `Actual is similar to expected with a score over ${minFuzzyScore}\n\nActual:\n\n  ${actuals.reprompt}\n\nFuzzy Expected:\n\n  ${expectedReprompt}\n\nActual Fuzzy Score:\n\n  ${score}`
          );
        });
      }
    });
    return api(); // response.shouldEqual(...).shouldContain(...).{something}
  }

  return responseApi; // response.{something}
}

module.exports = {
  plain: (test, conversationApi, fixSpaces, fuzzyDefault) => initResponse(test, conversationApi, fixSpaces, fuzzyDefault, false),
  ssml: (test, conversationApi, fixSpaces, fuzzyDefault) => initResponse(test, conversationApi, fixSpaces, fuzzyDefault, true)
};
