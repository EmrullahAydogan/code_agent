import { Server as SocketIOServer } from 'socket.io';

export function setupWebSocket(io: SocketIOServer) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Handle ping/pong for connection health check
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
}
