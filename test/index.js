'use strict';

/* global describe */

describe('mqtt-osem-integration', function () {
  /* eslint-disable global-require */
  require('./test-mqttConfigParser');
  require('./test-mqtt');
  require('./test-ws');
  /* eslint-enable global-require */
});
