'use strict';

const { sendWebsocketMessage } = require('./websocket-server');

const mqtt = require('mqtt'),
  parseMQTTConfig = require('./mqttConfigParser'),
  log = require('./logger'),
  { addJob } = require('./queue'),
  config = require('config').get('mqtt_client');

const RETRY_AFTER_MINUTES = Number(config.get('retry_after_minutes'));

// use this object as simple key/value store for connecting/disconnecting
const mqttConnections = {};

const getClient = function getClient (
  { url, connectionOptions, topic },
) {

  const client = mqtt.connect(url, connectionOptions);

  return new Promise(function (resolve, reject) {
    client.on('error', function (err) {
      client.end(true);

      return reject(err);
    });

    client.on('close', function () {
      client.end(true);

      return reject(new Error('Connection closed.'));
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
    sendWebsocketMessage(box._id, err);
    log.error(err);
  }

  if (mqttCfg && !mqttCfg.enabled) {
    return;
  }
  const msg = { 'mqtt-client': `ℹ️ connecting mqtt for box ${box._id}` };
  sendWebsocketMessage(box._id, msg);
  log.info(msg);

  try {
    const client = await getClient(
      mqttCfg.internalConnectionOptions
    );
    const msg = { 'mqtt-client': `ℹ️ connected mqtt for box ${box._id}` };
    sendWebsocketMessage(box._id, msg);
    log.info(msg);

    mqttConnections[box._id] = client;

    client.on('error', function (err) {
      const msg = {
        'mqtt-client': `🚨 mqtt error for box ${box._id}. Retry after ${RETRY_AFTER_MINUTES} minutes.`,
      };
      log.error(err, msg);
      sendWebsocketMessage(box._id, msg);

      // Add box to retry queue
      addJob('retry_connect', { box });
    });

    client.on('close', function () {
      const msg = { 'mqtt-client': `ℹ️ mqtt closed for box: ${box._id}` };
      sendWebsocketMessage(box._id, msg);
      log.info(msg);

      // Add box to retry queue
      addJob('retry_connect', { box });
    });

    client.on('message', mqttCfg.decodeAndSaveMessage);
  } catch (err) {
    const msg = {
      'mqtt-client': `🚨 mqtt error for box ${box._id}. Retry after ${RETRY_AFTER_MINUTES} minutes.`,
    };
    log.error(err, msg);
    sendWebsocketMessage(box._id, msg);

    // Add box to retry queue
    const status = await addJob('retry_connect', { box });
    switch (status) {
    case 'MAX_ATTEMPTS':
      disconnect(box);
      break;

    default:
      // Nothing to do here
      break;
    }
  }
};

const disconnect = function disconnect ({ _id }) {
  if (mqttConnections[_id]) {
    mqttConnections[_id].end(true);
    mqttConnections[_id] = undefined;

    const msg = { 'mqtt-client': `ℹ️ mqtt disconnected for box ${_id}` };
    log.info(msg);
    sendWebsocketMessage(_id, msg);
  }
};

module.exports = {
  connect,
  disconnect
};
