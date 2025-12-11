import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const setupSocketIO = (httpServer: HttpServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware für Socket-Authentifizierung
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
      
      socket.data.userId = (decoded as { userId: string }).userId;
      next();
    });
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`✅ Client verbunden: ${socket.id} (User: ${userId})`);

    // Join User-spezifischen Room für gezielte Updates
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      console.log(`❌ Client getrennt: ${socket.id}`);
    });
  });

  return io;
};

// Helper-Funktion zum Emitten von Email-Updates
export const emitEmailUpdate = (io: SocketServer, userId: string, data: any): void => {
  io.to(`user:${userId}`).emit('email:update', data);
};

