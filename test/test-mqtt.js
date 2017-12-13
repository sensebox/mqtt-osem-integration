'use strict';

/* global describe it before after */
const expect = require('chai').expect,
  dbConnectionString = require('./helpers/dbConnectionString'),
  {
    db: { connect, mongoose },
    Box
  } = require('@sensebox/opensensemap-api-models'),
  senseBox = require('./helpers/senseBox');

describe('mqtt client', function() {
  before(async function() {
    return connect(dbConnectionString({ db: 'mqttTest' }));
  });
});
