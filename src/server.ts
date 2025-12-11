import app from './app';
import { connectDatabase } from './database/connection';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Starte Server
const startServer = async () => {
  try {
    // Verbinde mit Datenbank
    await connectDatabase();
    
    // Starte Express Server
    app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf Port ${PORT}`);
      console.log(`📧 Email API verfügbar unter http://localhost:${PORT}/api/emails`);
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

