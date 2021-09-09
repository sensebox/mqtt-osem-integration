'use strict';

const config = require('config').get('wss_test_client');

module.exports = function wssBox (
  // parameter destructuring
  { enabled, url, topic, connectionOptions, decodeOptions, messageFormat } = {
    // defaults
    enabled: true,
    url: config.get('url'),
    topic: 'generalTestTopic',
    messageFormat: 'csv',
  }
) {
  return {
    name: 'wssTestSenseBox',
    location: [7.62, 51.96],
    exposure: 'outdoor',
    model: 'homeEthernet',
    mqtt: {
      enabled,
      url,
      topic,
      connectionOptions,
      decodeOptions,
      messageFormat,
    },
  };
};
