'use strict';

const config = require('config').get('redis');
const { Worker } = require('bullmq');
const { retry } = require('./worker/retry');
const logger = require('./logger');

const init = function init () {
  try {
    const worker = new Worker(config.get('queue'), retry, {
      connection: {
        host: config.get('host'),
        port: config.get('port'),
        username: config.get('username'),
        password: config.get('password'),
        db: config.get('db'),
      },
      autorun: false,
    });

    worker.on('error', (err) => {
      logger.error(err);
    });

    // Start worker
    worker.run();
  } catch (error) {
    logger.error(error);
  }

};

module.exports = {
  init
};
