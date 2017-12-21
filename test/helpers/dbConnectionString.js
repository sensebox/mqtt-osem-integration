'use strict';

module.exports = function createDbConnectionString({
  db = 'OSeM-api',
  host = 'localhost',
  port = 27018
} = {}) {
  return `mongodb://${host}:${port}/${db}`;
};
