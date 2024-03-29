'use strict';

const log = require('./logger'),
  { decoding, Box } = require('@sensebox/opensensemap-api-models');
const { sendWebsocketMessage } = require('./websocket-server');

// see https://github.com/mqttjs/MQTT.js#client
const USER_CONNECT_OPTIONS_ALLOWED_KEYS = [
  'keepalive',
  'reschedulePings',
  'clientId',
  'username',
  'password',
  'connectTimeout'
];

// userConnectionOptions is a string which contains json
const parseUserConnectionOptions = function parseUserConnectionOptions (
  userConnectionOptions
) {
  const opts = {};

  if (userConnectionOptions) {
    const userOptions = JSON.parse(userConnectionOptions);

    if (userOptions) {
      // just handle keys in the ALLOWED_KEYS array
      for (const key of USER_CONNECT_OPTIONS_ALLOWED_KEYS) {
        if (userOptions[key]) {
          opts[key] = userOptions[key];
        }
      }
    }
  }

  // check if there was a user supplied clientId
  // and if not generate one..
  if (!opts.clientId || typeof opts.clientId !== 'string') {
    opts.clientId = `osem_${Math.random().toString(16)
      .substr(2, 8)}`;
  }

  // check if there was a user supplied connectTimeout
  // and if not set to 5 seconds
  if (!opts.connectTimeout || isNaN(Number(opts.connectTimeout))) {
    opts.connectTimeout = 5 * 1000;
  }

  return opts;
};

/**
 * Parse the mqtt integration configuration and return its validated properties
 * @param {any} box a Box with mqtt integration configuration
 * @return {Object} an object containing an internalConnectionOptions object
 *          with url, topic, connectionOptions and a decodeAndSaveMessage
 *          function along with the box id for the given input box
 * @throws Invalid configuration will make this function throw an Error
 */
module.exports = function parseConfig (box) {
  if (!box.integrations || !box.integrations.mqtt) {
    throw new Error(`No mqtt configuration found for box ${box._id}`);
  }

  if (!box.integrations.mqtt.enabled) {
    return { enabled: false };
  }

  for (const prop of ['url', 'topic', 'messageFormat']) {
    if (!box.integrations.mqtt[prop]) {
      throw new Error(
        `Missing mqtt configuration property ${prop} for box ${box._id}`
      );
    }
  }

  /* eslint-disable prefer-const */
  let {
    url,
    topic,
    messageFormat,
    connectionOptions,
    decodeOptions,
    enabled
  } = box.integrations.mqtt;
  /* eslint-enable prefer-const */

  // validate connectionOptions
  try {
    connectionOptions = parseUserConnectionOptions(connectionOptions);
  } catch (err) {
    const msg = `🚨 Connection options of box ${box._id} not parseable: ${err}`;
    throw new Error(msg);
  }

  // validate decodeOptions
  if (decodeOptions) {
    try {
      decodeOptions = JSON.parse(decodeOptions);
    } catch (err) {
      const msg = {
        'mqtt-client': `⚠️ mqtt decode options of box ${box._id} not parseable: ${err}`,
      };
      decodeOptions = undefined;
      log.warn(msg);
      sendWebsocketMessage(box._id, msg);
    }
  }

  // try to find a handler
  const handler = decoding[messageFormat];
  if (!handler) {
    throw new Error(
      `Invalid messageFormat "${messageFormat}" for box ${box._id}`
    );
  }

  return {
    enabled,
    _id: box._id,
    internalConnectionOptions: {
      url,
      topic,
      connectionOptions
    },
    async decodeAndSaveMessage (topic, message) {
      // decode the measurements, query the database for the box,
      // then save the measurements
      try {
        const decodedMeasurement = await handler.decodeMessage(
          message.toString(),
          decodeOptions
        );
        const msg = {
          'mqtt-client': `✅ received, decoded the following mqtt message for box ${box._id}: ${JSON.stringify(decodedMeasurement)}`,
        };
        log.info(msg);
        sendWebsocketMessage(box._id, msg);

        // Populate lastMeasurement on box
        const BOX_SUB_PROPS_FOR_POPULATION = [
          {
            path: 'sensors.lastMeasurement', select: { value: 1, createdAt: 1, _id: 0 }
          },
        ];

        const theBox = await Box.findById(box._id).populate(BOX_SUB_PROPS_FOR_POPULATION);

        const { ok, n } = await theBox.saveMeasurementsArray(decodedMeasurement);
        if (ok === n) {
          const msg = {
            'mqtt-client': `✅ received, decoded and saved mqtt message for box ${box._id}`,
          };
          sendWebsocketMessage(box._id, msg);
          log.info(msg);
        }
      } catch (err) {
        const msg = {
          'mqtt-client': `🚨 error saving mqtt message for box ${box._id}: ${err}`,
        };
        sendWebsocketMessage(box._id, msg);
        log.error(msg);
      }
    }
  };
};
