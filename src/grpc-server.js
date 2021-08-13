'use strict';

const grpcLibrary = require('@grpc/grpc-js'),
  protoLoader = require('@grpc/proto-loader'),
  { Box } = require('@sensebox/opensensemap-api-models'),
  MQTTClient = require('./client'),
  fs = require('fs'),
  log = require('./logger'),
  config = require('config').get('grpc'),
  { mqttProto } = require('@sensebox/osem-protos');

// const { MqttService } = grpc.load(mqttProto);
const packageDefinition = protoLoader.loadSync(mqttProto);
const MqttService = grpcLibrary.loadPackageDefinition(packageDefinition).MqttService;


const connectBox = async function connectBox (call, callback) {
  const { box_id } = call.request;
  log.info({ 'grpc-server': `Request connectBox for ${box_id} ` });

  try {
    const box = await Box.findById(
      box_id,
      { 'integrations.mqtt': 1 },
      { lean: true }
    );
    if (!box) {
      return callback(new Error(`Box with id ${box_id} does not exist.`));
    }

    MQTTClient.connect(box);

    return callback(null, { result: 0 });
  } catch (err) {
    return callback(err);
  }
};

const disconnectBox = function disconnectBox (call, callback) {
  const { box_id } = call.request;
  log.info({ 'grpc-server': `Request disconnectBox for ${box_id} ` });

  MQTTClient.disconnect({ _id: box_id });

  return callback(null, {});
};

const prepareCredentials = function prepareCredentials () {
  const certs = ['ca_cert', 'server_cert', 'server_key'].map(key => {
    const config_key = config.get(`certificates.${key}`);

    // Check if the value is the certificate or key itself
    if (config_key.startsWith('-----BEGIN')) {
      return Buffer.from(config_key);
    }

    // Otherwise treat the value as input path and try to read the file
    return fs.readFileSync(config_key);
  });

  return grpcLibrary.ServerCredentials.createSsl(
    certs[0],
    [
      {
        cert_chain: certs[1],
        private_key: certs[2]
      }
    ],
    true
  );
};

const init = function init () {
  const port = Number(config.get('port'));
  log.info({ 'grpc-server': `Starting MQTT Integration GRPC server on port ${port}` });

  const credentials = prepareCredentials();

  const server = new grpcLibrary.Server();
  server.addService(MqttService.service, { connectBox, disconnectBox });
  server.bind(`0.0.0.0:${port}`, credentials);
  server.start();
  log.info({ 'grpc-server': 'MQTT Integration GRPC server started' });
};

module.exports = { init };
