import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
    auth: {
      token
    },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('✅ Socket.IO verbunden');
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket.IO getrennt');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO Verbindungsfehler:', error);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

