'use strict';

const _ = require('underscore');

function buildSlots(slots) {
  const res = {};
  _.each(slots, (value, key) => {
    if ( _.isString(value)) {
      res[key] = {
        name: key,
        value: value
      };
    } else {
      res[key] = {
        ...value,
        name: key
      };
    }
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
      context: {
        System: {
          device: {
            deviceId: 'deviceId',
            supportedInterfaces: {
              AudioPlayer: {}
            }
          },
          application: {
            applicationId: options.appId
          },
          user: {
            userId: options.userId,
            accessToken: options.accessToken,
            permissions: {
              consentToken: 'ContentTokenZZZZZ'
            }
          },
          apiEndpoint: 'https://api.amazonalexa.com',
          apiAccessToken: 'AxThk...'
        },
        AudioPlayer: {
          playerActivity: 'PLAYING',
          token: 'audioplayer-token',
          offsetInMilliseconds: 0
        }
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

    if (options.contextObj !== null) {
      res.context = options.contextObj;
    }
    isNew = false;
    return res;
  }

  return api;
}

module.exports = {init};
