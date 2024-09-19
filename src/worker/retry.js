'use strict';

const { connect } = require('../client');

const retry = async function retry (job) {
  const { box } = job.data;
  connect(box);
};

module.exports = {
  retry
};
