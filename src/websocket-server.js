'use strict';

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const log = require('./logger.js');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 4000;

// Middleware
io.use((socket, next) => {
  // Check if user is logged in

  // check if user is owner of device

  next();
});

io.on('connection', (socket) => {
  log.info(`⚡: ${socket.id} user just connected!`);

  // Create a room for every device
  socket.join(socket.handshake.query.deviceId);
  socket.on('disconnect', () => {
    log.info('🔥: A user disconnected');
  });
});

const init = function init () {
  httpServer.listen(PORT, () => {
    log.info(`🔌 Websocket server is listening on ${PORT}`);
  });
};

const sendWebsocketMessage = function sendWebsocketMessage (deviceId, message) {
  io.to(deviceId).emit('messages', message, (err, response) => {
    if (err) {
      log.error('🚨', err);
    } else {
      log.info('✅', response);
    }
  });
};

module.exports = { init, sendWebsocketMessage };
