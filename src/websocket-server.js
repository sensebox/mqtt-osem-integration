'use strict';

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const config = require('config').get('websocket');
const log = require('./logger.js');
const { verifyJwt } = require('./lib/helpers.js');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:8000',
    credentials: true
  }
});

// Middleware
io.use(verifyJwt);

io.on('connection', (socket) => {
  log.info(`⚡: ${socket.id} user just connected!`);

  // Create a room for every device
  socket.join(socket.handshake.query.deviceId);
  socket.on('disconnect', () => {
    log.info('🔥: A user disconnected');
  });
});

const init = function init () {
  const port = Number(config.get('port'));
  httpServer.listen(port, () => {
    log.info(`🔌 Websocket server is listening on ${port}`);
  });
};

const sendWebsocketMessage = function sendWebsocketMessage (deviceId, message) {
  io.to(`${deviceId}`).emit('messages', message);
};

module.exports = { init, sendWebsocketMessage };
