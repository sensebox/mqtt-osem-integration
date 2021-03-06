'use strict';

/* global describe it before */
const expect = require('chai').expect,
  dbConnectionString = require('./helpers/dbConnectionString'),
  { db: { connect }, Box } = require('@sensebox/opensensemap-api-models'),
  senseBox = require('./helpers/senseBox'),
  mqttClient = require('../src/client'),
  mqtt = require('mqtt');

describe('mqtt client', function () {
  let testBox;
  before(async function () {
    await connect(dbConnectionString({ db: 'mqttTest' }));

    testBox = await Box.initNew(senseBox());
    mqttClient.connect(testBox);
    const mqclient = mqtt.connect(testBox.integrations.mqtt.url);

    return new Promise(resolve => {
      mqclient.on('connect', () => {
        setTimeout(() => {
          mqclient.subscribe('generalTestTopic');
          mqclient.publish(
            'generalTestTopic',
            testBox.sensors.map(s => `${s._id},4`).join('\n')
          );
          setTimeout(() => {
            resolve();
          }, 100);
        }, 100);
      });
    });
  });

  it('should accept measurements via mqtt message', async function () {
    const box = await Box.findBoxById(testBox._id, {
      onlyLastMeasurements: true
    });

    for (const sensor of box.sensors) {
      expect(sensor.lastMeasurement.value).equal('4');
    }
  });
});
