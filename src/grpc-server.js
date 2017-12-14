'use strict';

const grpc = require('grpc'),
  { Box } = require('@sensebox/opensensemap-api-models'),
  MQTTClient = require('./client');

const { BoxRefresher } = grpc.load(`${__dirname}/mqtt-service.proto`);

const refreshBox = async function refreshBox(call, callback) {
  const { box_id } = call.request;

  try {
    const box = await Box.findById(
      box_id,
      { 'integrations.mqtt': 1 },
      { lean: true }
    );
    MQTTClient.connect(box);

    return callback(null, { result: 0 });
  } catch (err) {
    return callback(err);
  }
};

const init = function init() {
  const server = new grpc.Server();
  server.addService(BoxRefresher.service, { refreshBox });
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
};

module.exports = { init };
