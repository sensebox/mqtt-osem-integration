'use strict';

const { db: { connect }, Box } = require('@sensebox/opensensemap-api-models'),
  log = require('./logger.js'),
  MQTTClient = require('./client');

const findMQTTBoxes = function findMQTTBoxes() {
  return Box.find(
    { 'integrations.mqtt.enabled': true },
    { 'integrations.mqtt': 1 }
  )
    .lean()
    .exec();
};

// executed after the connection to the database has been established
const onDbConnected = async function onDbConnected() {
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
};

// connect to the database
connect()
  .then(onDbConnected)
  .catch(function onDbError(err) {
    log.fatal({ err });
  });
