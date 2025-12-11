# Frontend - Email Management System

Vue 3 Frontend für die Fullstack Developer Testaufgabe.

## Setup

1. Abhängigkeiten installieren:
```bash
npm install
```

2. Umgebungsvariablen konfigurieren:
Erstelle eine `.env` Datei:
```
VITE_API_URL=http://localhost:3000/api
```

3. Development-Server starten:
```bash
npm run dev
```

Das Frontend läuft dann auf `http://localhost:5173`

## Struktur

- `src/views/LoginView.vue`: Login- und Registrierungsseite
- `src/views/EmailsView.vue`: Email-Übersicht (Pagination muss implementiert werden)
- `src/services/api.ts`: Axios-basierter API-Client mit JWT-Authentifizierung
- `src/services/socket.ts`: Socket.IO Client Setup
- `src/services/emailService.ts`: Email-spezifische API-Calls
- `src/stores/auth.ts`: Pinia Store für Authentifizierung

## TODO für Bewerber

1. Implementiere die Pagination in `EmailsView.vue`
2. Verwende die Route `GET /api/emails/paginated` statt `getAll`
3. Zeige Pagination-Controls (Vorherige/Nächste Seite, Seitenzahlen)
4. Handle Socket.IO Events für Real-Time Updates
