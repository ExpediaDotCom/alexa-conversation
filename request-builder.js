'use strict';

const _ = require('underscore');

function buildSlots(slots) {
  const res = {};
  _.each(slots, (value, key) => {
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

function init(options) {
  let isNew = true;

  // public API

  const api = {
    init,
    build
  };

  function build(intentName, slots, prevEvent) {
    if (!options.appId) throw String('AppId not specified. Please run events.init(appId) before building a Request');
    const res = { // override more stuff later as we need
      session: {
        sessionId: options.sessionId,
        application: {
          applicationId: options.appId
        },
        attributes: buildSession(prevEvent),
        user: {
          userId: options.userId,
          accessToken: options.accessToken
        },
        new: isNew
      },
      request: {
        type: 'IntentRequest',
        requestId: options.requestId,
        locale: options.locale,
        timestamp: (new Date()).toISOString(),
        intent: {
          name: intentName,
          slots: buildSlots(slots)
        }
      },
      version: '1.0'
    };
    isNew = false;
    return res;
  }

  return api;
}

module.exports = {init};
