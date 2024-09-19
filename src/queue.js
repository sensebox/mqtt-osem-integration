'use strict';

const redis = require('config').get('redis');
const config = require('config').get('mqtt_client');
const { Queue } = require('bullmq');
const logger = require('./logger');

const RETRY_AFTER_MINUTES = Number(config.get('retry_after_minutes'));
const NUMBER_RETRIES = Number(config.get('num_retries'));

let queue;

const retryAttempts = {};

const requestQueue = () => {
  if (queue) {
    return queue;
  }
  queue = new Queue(redis.get('queue'), {
    connection: {
      host: redis.get('host'),
      port: redis.get('port'),
      username: redis.get('username'),
      password: redis.get('password'),
      db: redis.get('db'),
    }
  });

  return queue;
};

const addJob = async (hash, data) => {
  if (!retryAttempts[data.box._id]) {
    retryAttempts[data.box._id] = 0;
  }

  logger.info(`Retry Attempts for ${data.box._id}: ${retryAttempts[data.box._id]}`);
  if (retryAttempts[data.box._id] === NUMBER_RETRIES) {
    delete retryAttempts[data.box._id];

    return 'MAX_ATTEMPTS';
  }

  try {
    await requestQueue()
      .add(hash, data, {
        delay: RETRY_AFTER_MINUTES * 60000,
        removeOnComplete: {
          age: 72 * 3600, // keep up to 72 hours
          count: 1000, // keep up to 1000 jobs
        },
        removeOnFail: {
          age: 72 * 3600, // keep up to 72 hours
        },
      });
    retryAttempts[data.box._id] = retryAttempts[data.box._id] + 1;

    return 'JOB_ADDED';
  } catch (error) {
    logger.error(error);
  }
};

module.exports = {
  requestQueue,
  addJob
};
