'use strict';

const colors = require('colors/safe');
const StackTrace = require('stacktrace-js');
const _ = require('underscore');
const RequestBuilder = require('./request-builder');
const response = require('./response');

function sendRequest(event, handler) {
  return new Promise((resolve, reject) => {
    handler(event, {
      succeed: resolve,
      fail: reject
    });
  });
}

function errorLogger(reason) {
  console.log(colors.red.underline(`ERROR: ${reason}`));
  StackTrace.fromError(reason).then(console.log);
}

module.exports = function conversation({name, app, appId,
  sessionId = 'SessionId.ee2e2123-75dc-4b32-bf87-8633ba72c294',
  userId = 'amzn1.ask.account.AHEYQEFEHVSPRHPZS4ZKSLDADKC62MMFTEC7MVZ636U56XIFWCFUAJ2Q2RJE47PNDHDBEEMMDTEQXWFSK3OPALF4G2D2QAJW4SDMEI5DCULK5G4R32T76G5SZIWDMJ2ZZQ37UYH2BIXBQ3GIGEBIRW4M4YV5QOQG3JXHB73CTH6AAPYZBOIQE5N3IKUETT54HMTRUX2EILTFGWQ',
  accessToken = '0b42d14150e71fb356f2abc42f5bc261dd18573a86a84aa5d7a74592b505a0b7',
  requestId = 'EdwRequestId.33ac9138-640f-4e6e-ab71-b9619b2c2210',
  locale = 'en-US',
  fixSpaces = false,
  fuzzyDistance = 0.93,
  handler = (app && app.handler) || null
}) {
  if (handler === null) throw new Error('Must provide either an app or handler.');

  const requestBuilder = RequestBuilder.init({appId, sessionId, userId, accessToken, requestId, locale});
  // chain of promises to handle the different conversation steps
  const conversationName = name;
  const tests = [];
  let dialog = Promise.resolve(); // start of chain of promises
  let step = -1;

  const api = { // public API
    userSays,
    thenPlainResponse: null, // placeholder
    thenSsmlResponse: null, // placeholder
    end
  };

  // Private

  function printSlots(slots) {
    if (!_.isEmpty(slots)) {
      let res = 'SLOTS: {';
      _.each(slots, (value, key) => {
        res += `${key}: ${value},`;
      });
      return res.substring(0, res.length - 1) + '}';
    }
    return '';
  }

  function executeTestCase(testCase) {
    describe(`User triggers: ${testCase.intentName} ${printSlots(testCase.slots)}`, () => {
      testCase.checks.forEach(check => check(testCase));
    });
  }

  function testConversation() {
    describe(`Conversation: ${conversationName}`, () => {
      tests.forEach(executeTestCase);
    });
  }

  function initStep(i) {
    tests[i] = tests[i] || {checks: []};
  }

  // Public

  function userSays(intentName, slotsArg) {
    step++;
    initStep(step);
    const slots = slotsArg || {};
    const index = step;
    dialog = dialog.then(prevEvent =>
      sendRequest(requestBuilder.build(intentName, slots, prevEvent), handler).then(res => {
        tests[index] = _.extend(tests[index], {intentName, slots, actual: res});
        return res;
      })
    ); // return promise already

    const testCase = tests[step];
    api.plainResponse = response.plain(testCase, api, fixSpaces, fuzzyDistance);
    api.ssmlResponse = response.ssml(testCase, api, fixSpaces, fuzzyDistance);

    return api;
  }

  function end() { // runs the tests stored in `dialog` in seq
    describe(`Executing conversation: ${conversationName}`, function() {
      this.timeout(5000);
      before(() => dialog.then(testConversation).catch(errorLogger));
      it('Finished executing conversation', done => done());
      // http://stackoverflow.com/questions/22465431/how-can-i-dynamically-generate-test-cases-in-javascript-node
    });
  }

  return api;
};
