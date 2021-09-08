'use strict';

/* global describe it before */
const expect = require('chai').expect,
  dbConnectionString = require('./helpers/dbConnectionString'),
  {
    db: { connect },
    Box,
  } = require('@sensebox/opensensemap-api-models'),
  wsBox = require('./helpers/ws'),
  mqttClient = require('../src/client'),
  mqtt = require('mqtt');

describe('ws client', function () {
  let testBox;
  before(async function () {
    await connect(dbConnectionString({ db: 'mqttTest' }));

    testBox = await Box.initNew(wsBox());
    mqttClient.connect(testBox);
    const mqclient = mqtt.connect(testBox.integrations.mqtt.url);

    return new Promise((resolve) => {
      mqclient.on('connect', () => {
        setTimeout(() => {
          mqclient.subscribe(testBox.integrations.mqtt.topic);
          mqclient.publish(
            testBox.integrations.mqtt.topic,
            testBox.sensors.map((s) => `${s._id},10`).join('\n')
          );
          setTimeout(() => {
            resolve();
          }, 100);
        }, 100);
      });
    });
  });

  it('should accept measurements via ws message', async function () {
    const box = await Box.findBoxById(testBox._id, {
      onlyLastMeasurements: true,
    });

    for (const sensor of box.sensors) {
      expect(sensor.lastMeasurement.value).equal('10');
    }
  });
});
