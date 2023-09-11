'use strict';

const pino = require('pino');

module.exports = pino({
  name: 'mqtt-osem-integration',
  serializers: pino.stdSerializers,
});
