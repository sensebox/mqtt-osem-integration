'use strict';

module.exports = function mqttsBox (
  // parameter destructuring
  { enabled, url, topic, connectionOptions, decodeOptions, messageFormat } = {
    // defaults
    enabled: true,
    url: '<your.mqtts.connection.string>',
    topic: 'generalTestTopic',
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
