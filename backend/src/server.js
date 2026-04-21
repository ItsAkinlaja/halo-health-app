require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const { logger } = require('./utils/logger');

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:19006',
    methods: ['GET', 'POST'],
  },
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join user to their personal room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  // Join community rooms
  socket.on('join-community', (communityId) => {
    socket.join(`community-${communityId}`);
    logger.info(`User joined community ${communityId}`);
  });

  // Handle real-time scan updates
  socket.on('scan-update', (data) => {
    socket.to(`user-${data.userId}`).emit('scan-completed', data);
  });

  // Handle real-time notifications
  socket.on('notification', (data) => {
    socket.to(`user-${data.userId}`).emit('new-notification', data);
  });

  // Handle community updates
  socket.on('community-update', (data) => {
    socket.to(`community-${data.communityId}`).emit('community-activity', data);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`API Health Check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io };
