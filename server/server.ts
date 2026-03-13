import { createServer } from 'http';
import app from './app';
import { connectDatabase } from './database/connection';
import { setupSocketIO } from './socket/socketHandler';
import dotenv from 'dotenv';
import { sendMails } from './controllers/emailController';
import cron from 'node-cron';

dotenv.config();

const PORT = process.env.PORT || 3005;

// Starte Server
const startServer = async () => {
  try {
    // Verbinde mit Datenbank
    await connectDatabase();
    
    // Erstelle HTTP Server
    const httpServer = createServer(app);
    
    // Setup Socket.IO
    const io = setupSocketIO(httpServer);
    
    // Exportiere io für Verwendung in anderen Modulen
    (app as any).io = io;
    

    // Starte Server
    httpServer.listen(PORT, () => {
 
      console.log(`🚀 Server läuft auf Port ${PORT}`);
      console.log(`📧 Email API verfügbar unter http://localhost:${PORT}/api/emails`);
      console.log(`🔌 Socket.IO bereit`);

           cron.schedule('* * * * *',  async() => {
            console.log("CRON EXECUTION")
    // await sendMails();
    console.log("CRON EXECUTED")
});
    });
  } catch (error) {
    console.error('Fehler beim Starten des Servers:', error);
    process.exit(1);
  }
};

startServer();

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM Signal empfangen. Server wird beendet...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT Signal empfangen. Server wird beendet...');
  process.exit(0);
});

