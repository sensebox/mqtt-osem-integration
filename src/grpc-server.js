'use strict';

const grpc = require('grpc'),
  { Box } = require('@sensebox/opensensemap-api-models'),
  MQTTClient = require('./client'),
  fs = require('fs'),
  log = require('./logger'),
  config = require('config'),
  { mqttProto } = require('@sensebox/osem-protos');

const { MqttBoxRefresher } = grpc.load(mqttProto);

const refreshBox = async function refreshBox(call, callback) {
  const { box_id } = call.request;

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

const prepareCredentials = function prepareCredentials() {
  const certs = ['ca_cert', 'server_cert', 'server_key'].map(key => {
    const config_key = config.get(`grpc.certificates.${key}`);

    // Check if the value is the certificate or key itself
    if (config_key.startsWith('-----BEGIN')) {
      return config_key;
    }

    // Otherwise treat the value as input path and try to read the file
    return fs.readFileSync(config_key);
  });

  return grpc.ServerCredentials.createSsl(
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

const init = function init() {
  const port = Number(config.get('grpc.port'));
  log.info(`Starting GRPC server on port ${port}`);

  const credentials = prepareCredentials();

  const server = new grpc.Server();
  server.addService(MqttBoxRefresher.service, { refreshBox });
  server.bind(`0.0.0.0:${port}`, credentials);
  server.start();
};

module.exports = { init };
