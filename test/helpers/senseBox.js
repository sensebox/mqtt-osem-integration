'use strict';

module.exports = function senseBox(
  // parameter destructuring
  { enabled, url, topic, connectionOptions, decodeOptions, messageFormat } = {
    // defaults
    enabled: true,
    url: 'mqtt://localhost:1884',
    topic: 'generalTestTopic',
    messageFormat: 'csv'
  }
) {
  return {
    name: 'mqttTestSenseBox',
    location: [7.62, 51.96],
    exposure: 'outdoor',
    model: 'homeEthernet',
    mqtt: {
      enabled,
      url,
      topic,
      connectionOptions,
      decodeOptions,
      messageFormat
    }
  };
};
