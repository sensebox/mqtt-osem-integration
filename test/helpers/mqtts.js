'use strict';

const config = require('config').get('mqtts_test_client');

module.exports = function mqttsBox (
  // parameter destructuring
  { enabled, url, topic, connectionOptions, decodeOptions, messageFormat } = {
    // defaults
    enabled: true,
    url: config.get('url'),
    topic: 'integration',
    messageFormat: 'csv',
  }
) {
  return {
    name: 'mqttsTestSenseBox',
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
