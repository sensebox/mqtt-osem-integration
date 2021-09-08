'use strict';

module.exports = function wssBox (
  // parameter destructuring
  { enabled, url, topic, connectionOptions, decodeOptions, messageFormat } = {
    // defaults
    enabled: true,
    url: 'ws://localhost:8884',
    topic: 'generalTestTopic',
    messageFormat: 'csv',
  }
) {
  return {
    name: 'wsTestSenseBox',
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
