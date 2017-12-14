'use strict';

const grpc = require('grpc');

const { BoxRefresher } = grpc.load(`${__dirname}/src/mqtt-service.proto`);

const client = new BoxRefresher(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

client.refreshBox({ box_id: '5a325467c1a5ac315ff70c89' }, function(
  err,
  response
) {
  console.log(err);
  console.log(response);
});
