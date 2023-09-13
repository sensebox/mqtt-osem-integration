'use strict';

const {
    db: { connect, mongoose },
    Box
  } = require('@sensebox/opensensemap-api-models'),
  log = require('./logger.js'),
  MQTTClient = require('./client'),
  grpcServer = require('./grpc-server'),
  websocketServer = require('./websocket-server.js');

const findMQTTBoxes = function findMQTTBoxes () {
  return Box.find(
    { 'integrations.mqtt.enabled': true },
    { 'integrations.mqtt': 1 },
    { lean: true }
  );
};

// executed after the connection to the database has been established
const onDbConnected = async function onDbConnected () {
  // try to connect boxes with mqtt configuration upon first start
  let mqttBoxes;
  try {
    mqttBoxes = await findMQTTBoxes();

    for (const box of mqttBoxes) {
      MQTTClient.connect(box);
    }
  } catch (err) {
    log.error({ err });
  }

  // start the grpc server
  try {
    grpcServer.init();
    websocketServer.init();
  } catch (err) {
    log.fatal(err);
    mongoose.disconnect().then(function () {
      process.exit(1);
    });
  }
};

// connect to the database
connect()
  .then(onDbConnected)
  .catch(function onDbError (err) {
    log.fatal({ err });
  });
