'use strict';

/* global describe it */
const expect = require('chai').expect,
  mqttConfigParser = require('../src/mqttConfigParser');

describe('mqttConfigParser', function () {
  const configParserWrapper = function configParserWrapper (opts) {
    return () => {
      return mqttConfigParser({ integrations: { mqtt: opts } });
    };
  };

  it('should throw an error for missing integration configuration', function () {
    expect(() => {
      mqttConfigParser({});
    }).to.throw('No mqtt configuration found for box');
  });

  it('should throw an error for missing integration url', function () {
    expect(
      configParserWrapper({
        enabled: true,
        topic: 'test',
        messageFormat: 'json'
      })
    ).to.throw('Missing mqtt configuration property url for box');
  });

  it('should throw an error for missing integration topic', function () {
    expect(
      configParserWrapper({ enabled: true, url: 'test', messageFormat: 'json' })
    ).to.throw('Missing mqtt configuration property topic for box');
  });

  it('should throw an error for missing integration messageFormat', function () {
    expect(
      configParserWrapper({ enabled: true, url: 'test', topic: 'test' })
    ).to.throw('Missing mqtt configuration property messageFormat for box');
  });

  it('should throw an error for malformed connectionOptions', function () {
    expect(
      configParserWrapper({
        enabled: true,
        url: 'test',
        topic: 'test',
        messageFormat: 'json',
        connectionOptions: 'Malformed JSON'
      })
    ).to.throw(
      'Connection options of box undefined not parseable: SyntaxError:'
    );
  });

  it('should not throw an error for malformed decodeOptions', function () {
    expect(
      configParserWrapper({
        enabled: true,
        url: 'test',
        topic: 'test',
        messageFormat: 'json',
        decodeOptions: 'malformed JSON'
      })
    ).to.not.throw();
  });

  it('should throw an error for invalid messageFormat', function () {
    expect(
      configParserWrapper({
        enabled: true,
        url: 'test',
        topic: 'test',
        messageFormat: 'never implemented'
      })
    ).to.throw('Invalid messageFormat "never implemented" for box undefined');
  });

  it('should return cleaned up connectionOptions', function () {
    expect(
      configParserWrapper({
        enabled: true,
        url: 'test',
        topic: 'test',
        messageFormat: 'json',
        connectionOptions: JSON.stringify({
          foo: 'bar'
        })
      })()
    ).to.not.have.nested.property(
      'internalConnectionOptions.connectionOptions.foo'
    );
  });

  it('should return connectionOptions with supplied clientid', function () {
    expect(
      configParserWrapper({
        enabled: true,
        url: 'test',
        topic: 'test',
        messageFormat: 'json',
        connectionOptions: JSON.stringify({
          clientId: 'testClient'
        })
      })()
    ).to.have.nested.property(
      'internalConnectionOptions.connectionOptions.clientId',
      'testClient'
    );
  });

  it('should return connectionOptions with supplied connectTimeout', function () {
    expect(
      configParserWrapper({
        enabled: true,
        url: 'test',
        topic: 'test',
        messageFormat: 'json',
        connectionOptions: JSON.stringify({
          connectTimeout: 15
        })
      })()
    ).to.have.nested.property(
      'internalConnectionOptions.connectionOptions.connectTimeout',
      15
    );
  });

  it('should return a decodeAndSaveMessage function', function () {
    expect(
      configParserWrapper({
        enabled: true,
        url: 'test',
        topic: 'test',
        messageFormat: 'json'
      })().decodeAndSaveMessage
    ).to.be.a('function');
  });

  it('should return an object with enabled: false if mqtt is disabled', function () {
    expect(
      configParserWrapper({
        enabled: false
      })()
    ).to.have.nested.property('enabled', false);
  });
});
