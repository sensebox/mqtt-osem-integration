'use strict';

/* global describe it before */
const expect = require('chai').expect,
  dbConnectionString = require('./helpers/dbConnectionString'),
  {
    db: { connect },
    Box,
  } = require('@sensebox/opensensemap-api-models'),
  wsBox = require('./helpers/ws'),
  wssBox = require('./helpers/wss'),
  mqttClient = require('../src/client'),
  mqtt = require('mqtt');

describe('ws client', function () {
  let testBox;
  before(async function () {

    await new Promise((resolve) => setTimeout(resolve, 500));

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
          }, 1000);
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

describe('wss client', function () {
  let testBox;
  before(async function () {
    await connect(dbConnectionString({ db: 'mqttTest' }));

    testBox = await Box.initNew(wssBox());
    mqttClient.connect(testBox);
    const mqclient = mqtt.connect(testBox.integrations.mqtt.url);

    return new Promise((resolve) => {
      mqclient.on('connect', () => {
        setTimeout(() => {
          mqclient.subscribe(testBox.integrations.mqtt.topic);
          mqclient.publish(
            testBox.integrations.mqtt.topic,
            testBox.sensors.map((s) => `${s._id},12`).join('\n')
          );
          setTimeout(() => {
            resolve();
          }, 1000);
        }, 100);
      });
    });
  });

  it('should accept measurements via wss message', async function () {
    const box = await Box.findBoxById(testBox._id, {
      onlyLastMeasurements: true,
    });

    for (const sensor of box.sensors) {
      expect(sensor.lastMeasurement.value).equal('12');
    }
  });
});
