'use strict';

const assert = require('chai').assert;
// const sinon = require('sinon');
const conversation = require('../index.js');
const alexaSkill = require('./fixtures/alexa-skill-mock.js');


describe('Functional tests', function test() {
  beforeEach(() => {
    //
  });
  afterEach(() => {
    //
  });
  describe('Auto-split: On', () => {
    before(done => {
      done();
    });
    it('should have the handler property', () => {
      assert.isDefined(skill.handler, 'handler property is defined');
    });
    it('The handler property should be a function', () => {
      assert.isFunction(skill.handler);
    });
  });
});
