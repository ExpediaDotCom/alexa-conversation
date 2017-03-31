'use strict';

const intentStubs = require('./intent-stubs');

function handle(event, callbacks){
  const intentName = event.request.intent;
  const response =  intentStubs[intentName];
  if(response){
    callbacks.succeed(response);
  } else {
    callbacks.fail
  }
}

module.exports = {handle};
