'use strict';

const { sendWebsocketMessage } = require('./websocket-server');

const mqtt = require('mqtt'),
  parseMQTTConfig = require('./mqttConfigParser'),
  log = require('./logger'),
  config = require('config').get('mqtt_client');

const RETRY_AFTER_MINUTES = Number(config.get('retry_after_minutes')),
  NUMBER_RETRIES = Number(config.get('num_retries'));

// use this object as simple key/value store for connecting/disconnecting
const mqttConnections = {};

const _retryAfter = function _retryAfter (box, afterMinutes) {
  setTimeout(() => {
    connect(box);
  }, afterMinutes * 60000);
};

const getClient = function getClient (
  { url, connectionOptions, topic },
  maxRetries
) {
  let errRetries = maxRetries, closeRetries = maxRetries;

  const client = mqtt.connect(url, connectionOptions);
  client.reconnecting = true;

  return new Promise(function (resolve, reject) {
    client.on('error', function (err) {
      errRetries = errRetries - 1;
      if (errRetries === 0) {
        client.reconnecting = false;
        client.end(true);

        return reject(err);
      }
    });

    client.on('close', function () {
      closeRetries = closeRetries - 1;
      if (closeRetries === 0) {
        client.reconnecting = false;
        client.end(true);

        return reject(new Error('connection closed after 5 retries.'));
      }
    });

    client.on('connect', function () {
      client.subscribe(topic, function (err) {
        if (err) {
          return reject(err);
        }

        return resolve(client);
      });
    });
  });
};

const connect = async function connect (box) {
  // disconnect any running connections before reconnecting..
  disconnect(box);
  let mqttCfg;
  try {
    mqttCfg = parseMQTTConfig(box);
  } catch (err) {
    log.error(err);
  }

  if (!mqttCfg.enabled) {
    return;
  }
  const msg = { 'mqtt-client': `ℹ️ connecting mqtt for box ${box._id}` };
  sendWebsocketMessage(box._id, msg);
  log.info(msg);

  try {
    const client = await getClient(
      mqttCfg.internalConnectionOptions,
      NUMBER_RETRIES
    );
    const msg = { 'mqtt-client': `ℹ️ connected mqtt for box ${box._id}` };
    sendWebsocketMessage(box._id, msg);
    log.info(msg);

    mqttConnections[box._id] = client;

    client.on('close', function () {
      const msg = { 'mqtt-client': `ℹ️ mqtt closed for box: ${box._id}` };
      sendWebsocketMessage(box._id, msg);
      log.info(msg);
    });

    client.on('message', mqttCfg.decodeAndSaveMessage);
  } catch (err) {
    const msg = {
      'mqtt-client': `🚨 mqtt error for box ${box._id}. Retry after ${RETRY_AFTER_MINUTES} minutes.`,
    };
    log.error(err, msg);
    sendWebsocketMessage(box._id, msg);
    // retry after..
    _retryAfter(box, RETRY_AFTER_MINUTES);
  }
};

const disconnect = function disconnect ({ _id }) {
  if (mqttConnections[_id]) {
    mqttConnections[_id].end(true);
    mqttConnections[_id] = undefined;
    const msg = { 'mqtt-client': `ℹ️ mqtt disconnected mqtt for box ${_id}` };
    log.info(msg);
    sendWebsocketMessage(_id, msg);
  }
};

module.exports = {
  connect,
  disconnect
};
