'use strict';

const grpc = require('grpc'),
  fs = require('fs'),
  path = require('path'),
  { mqttProto } = require('@sensebox/osem-protos');

const { MqttService } = grpc.load(mqttProto);

const readCertFile = function readCertFile (filename) {
  return fs.readFileSync(path.join(process.cwd(), 'out', filename));
};

const ca = readCertFile('openSenseMap_CA.crt'),
  client_key = readCertFile('client.key'),
  client_crt = readCertFile('client.crt');

const credentials = grpc.credentials.createSsl(ca, client_key, client_crt);

const client = new MqttService('localhost:3925', credentials);

client.connectBox({ box_id: '5a325467c1a5ac315ff70c89' }, function (
  err,
  response
) {
  console.log(err);
  console.log(response);
});
