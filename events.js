'use strict';
const _ = require('underscore');

module.exports = (function() {
  let appId = '';
  let firstEvent = true;
  let initialOptions = {};

  function buildSlots(slots) {
    const res = {};
    _.each(slots, function(value, key) {
      res[key] = {
        name: key,
        value: value
      };
    });
    return res;
  }

  function buildSession(e) {
    return e ? e.sessionAttributes : {};
  }

  // public API

  const api = {
    init,
    buildRequest
  };

  function buildRequest(intentName, slots, isNew, prevEvent) {
    if (!appId) throw String('AppId not specified. Please run events.init(appId) before building a Request');
    const res = { // override more stuff later as we need
      session: {
        sessionId: 'SessionId.ee2e2123-75dc-4b32-bf87-8633ba72c294',
        application: {
          applicationId: appId
        },
        attributes: buildSession(prevEvent),
        user: {
          userId: 'amzn1.ask.account.AHEYQEFEHVSPRHPZS4ZKSLDADKC62MMFTEC7MVZ636U56XIFWCFUAJ2Q2RJE47PNDHDBEEMMDTEQXWFSK3OPALF4G2D2QAJW4SDMEI5DCULK5G4R32T76G5SZIWDMJ2ZZQ37UYH2BIXBQ3GIGEBIRW4M4YV5QOQG3JXHB73CTH6AAPYZBOIQE5N3IKUETT54HMTRUX2EILTFGWQ',
          accessToken: '0b42d14150e71fb356f2abc42f5bc261dd18573a86a84aa5d7a74592b505a0b7'
        },
        new: isNew
      },
      request: {
        type: 'IntentRequest',
        requestId: 'EdwRequestId.33ac9138-640f-4e6e-ab71-b9619b2c2210',
        locale: 'en-US',
        timestamp: (new Date()).toISOString(),
        intent: {
          name: intentName,
          slots: buildSlots(slots)
        }
      },
      version: '1.0'
    };
    firstEvent = false;
    return res;
  }

  function init(options) {
    appId = options.appId;
    initialOptions = options;
    firstEvent = true;
    return api;
  }

  return api;
})();
