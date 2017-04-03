'use strict';

const assert = require('chai').assert;
// const sinon = require('sinon');
const conversation = require('../index.js');
const alexaSkill = require('./fixtures/alexa-skill-mock.js');

describe('index.js (conversation)', function test() {
  beforeEach(() => {
    //
  });
  afterEach(() => {
    //
  });
  describe('instantiation', () => {
    it('should return object if instantiation is successful', () => {
      // assert.isDefined(skill.handler, 'handler property is defined');
    });
    it('should throw error if initialization is unsuccessful', () => {
      // assert.isFunction(skill.handler);
    });
  });
});
