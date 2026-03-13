# Fullstack Developer Testaufgabe - Email Rate Limiting

## Übersicht

Diese Aufgabe testet deine Fähigkeiten im Umgang mit Datenbanken, der Verarbeitung großer Datenmengen und der Implementierung von Rate-Limiting-Strategien. Du wirst ein System entwickeln, das 1000 Emails gleichzeitig verarbeitet, während ein externer Email-Provider nur 100 Emails pro Sekunde akzeptiert.

## Technologie-Stack

- **Backend**: TypeScript + Express.js + Socket.IO
- **Frontend**: Vue 3 (Composition API / Setup Syntax) + Vite + Pinia
- **Datenbank**: MongoDB (mit Mongoose)
- **Authentifizierung**: JWT (JSON Web Tokens)
- **Node.js**: Version 18 oder höher empfohlen

## Projekt-Setup

### Voraussetzungen

- Node.js (v18 oder höher)
- MongoDB (lokal installiert oder MongoDB Atlas Account)
- npm oder yarn

### Installation

#### Backend Setup

1. Repository klonen oder herunterladen
2. Backend-Abhängigkeiten installieren:
```bash
npm install
```

3. Umgebungsvariablen konfigurieren:
Erstelle eine `.env` Datei im Root-Verzeichnis:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/email-test
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

4. MongoDB starten (falls lokal):
```bash
# macOS mit Homebrew
brew services start mongodb-community

# Oder manuell
mongod
```

5. Backend-Server starten:
```bash
npm run dev
```

Der Backend-Server läuft dann auf `http://localhost:3000`

#### Frontend Setup

1. In das Frontend-Verzeichnis wechseln:
```bash
cd frontend
```

2. Frontend-Abhängigkeiten installieren:
```bash
npm install
```

3. Umgebungsvariablen konfigurieren:
Erstelle eine `.env` Datei im `frontend/` Verzeichnis:
```
VITE_API_URL=http://localhost:3000/api
```

4. Frontend-Development-Server starten:
```bash
npm run dev
```

Das Frontend läuft dann auf `http://localhost:5173`

#### Beide gleichzeitig starten

Um Frontend und Backend mit einem Befehl zu starten, verwende im Root-Verzeichnis:

```bash
npm run dev:all
```

Dies startet beide Server parallel. Die Ausgabe wird mit Farben und Labels (BACKEND/FRONTEND) formatiert.

**Alternative Befehle:**
- `npm run dev:backend` - Nur Backend starten
- `npm run dev:frontend` - Nur Frontend starten

## Datenbank-Schema

### User-Modell

- `username` (String, required, unique): Benutzername (min. 3, max. 30 Zeichen)
- `password` (String, required, min. 6 Zeichen): Gehashtes Passwort
- `createdAt` (Date, default: now): Erstellungszeitpunkt

### Email-Modell

- `subject` (String, required): Betreff der Email
- `toEmail` (String, required): Empfänger-Email-Adresse
- `fromEmail` (String, required): Absender-Email-Adresse
- `body` (String, required): Inhalt der Email
- `status` (Enum: 'pending' | 'sent' | 'failed', default: 'pending'): Status der Email
- `createdAt` (Date, default: now): Erstellungszeitpunkt
- `sentAt` (Date, optional): Zeitpunkt des Versands
- `error` (String, optional): Fehlermeldung bei fehlgeschlagenem Versand
- `externalId` (String, optional): ID vom externen Email-Provider (wird nach erfolgreichem Versand gesetzt)
- `ownerId` (String, required): ID des Besitzers/Erstellers (User-ID)

## Verfügbare API-Endpunkte

### Authentifizierung

#### 1. Registrierung
```
POST /api/auth/register
Body: { "username": "string", "password": "string" }
```
Registriert einen neuen User und gibt einen JWT-Token zurück.

#### 2. Login
```
POST /api/auth/login
Body: { "username": "string", "password": "string" }
```
Meldet einen User an und gibt einen JWT-Token zurück.

**Hinweis**: Alle Email-Endpunkte benötigen einen Authorization-Header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Email-Endpunkte (Authentifizierung erforderlich)

#### 1. Batch-Emails erstellen
```
POST /api/emails/create-batch
Headers: Authorization: Bearer <token>
```
Erstellt 1000 Email-Einträge in der Datenbank mit Status 'pending'. Die `ownerId` wird automatisch aus dem JWT-Token extrahiert.

#### 2. Alle Emails abrufen
```
GET /api/emails?status=pending&limit=100&skip=0
Headers: Authorization: Bearer <token>
```

#### 3. Paginierte Emails abrufen (TODO: Muss implementiert werden!)
```
GET /api/emails/paginated?page=1&limit=20&status=pending
Headers: Authorization: Bearer <token>
```
**Diese Route muss vom Bewerber implementiert werden!** Sie soll eine paginierte Liste von Emails zurückgeben mit Pagination-Metadaten.

#### 4. Einzelne Email abrufen
```
GET /api/emails/:id
Headers: Authorization: Bearer <token>
```

#### 5. Statistiken abrufen
```
GET /api/emails/stats
Headers: Authorization: Bearer <token>
```
Gibt eine Übersicht über die Anzahl der Emails pro Status zurück (nur für den eingeloggten User).

## Socket.IO Events

### Client → Server

Beim Verbinden muss der Client den JWT-Token im `auth.token` übergeben:
```javascript
socket = io('http://localhost:3000', {
  auth: { token: 'JWT_TOKEN' }
});
```

### Server → Client

#### `email:update`
Wird gesendet, wenn Emails aktualisiert wurden (z.B. nach dem Senden).
```javascript
socket.on('email:update', (data) => {
  // Lade Emails neu
});
```

## Frontend

Das Frontend bietet eine einfache Landingpage mit:

- **Login/Registrierung**: User können sich registrieren oder anmelden
- **Email-Übersicht**: Nach dem Login wird eine Liste aller Emails angezeigt
- **Socket.IO Integration**: Nach dem Senden von Emails wird die Tabelle automatisch aktualisiert
- **Pagination**: Die Pagination muss vom Bewerber implementiert werden

### Frontend-Struktur

- `src/views/LoginView.vue`: Login- und Registrierungsseite
- `src/views/EmailsView.vue`: Email-Übersicht mit Tabelle
- `src/services/api.ts`: Axios-basierter API-Client
- `src/services/socket.ts`: Socket.IO Client Setup
- `src/services/emailService.ts`: Email-spezifische API-Calls
- `src/stores/auth.ts`: Pinia Store für Authentifizierung

## Die Herausforderung

### Problemstellung

1. **1000 Emails gleichzeitig erstellen**: Über den Endpunkt `/api/emails/create-batch` werden 1000 Email-Einträge in der Datenbank erstellt.

2. **Rate-Limiting des Providers**: Der externe Email-Provider (`emailProviderService.ts`) erlaubt maximal **100 Emails pro Sekunde**. Wenn du versuchst, mehr zu senden, wirft der Service einen Fehler.

3. **Provider-API**: Die Funktion `sendEmailsToProvider()` akzeptiert ein Array von Email-Objekten und gibt ein Array zurück mit:
   - `string` (externalId) bei Erfolg
   - `undefined` bei Fehler

### Deine Aufgaben

#### Aufgabe 1: Email-Sending-Service mit Rate-Limiting

Implementiere einen **Email-Sending-Service**, der:

1. ✅ Alle pending Emails aus der Datenbank lädt (nur für den eingeloggten User)
2. ✅ Diese in Batches von maximal 100 Emails pro Sekunde an den Provider sendet
3. ✅ Die Ergebnisse verarbeitet und in der Datenbank aktualisiert:
   - Bei Erfolg: `status = 'sent'`, `externalId` setzen, `sentAt` setzen
   - Bei Fehler: `status = 'failed'`, `error` setzen
4. ✅ Ein Scheduling-System implementiert, das kontinuierlich pending Emails verarbeitet
5. ✅ Fehlerbehandlung und Retry-Logik berücksichtigt
6. ✅ Socket.IO Events sendet, wenn Emails aktualisiert werden (für Frontend-Updates)

#### Aufgabe 2: Pagination-Route implementieren

Implementiere die Route `GET /api/emails/paginated` im `emailController.ts`:

- **Query-Parameter**:
  - `page`: Seitennummer (default: 1)
  - `limit`: Anzahl pro Seite (default: 20)
  - `status`: Optionaler Filter nach Status
  
- **Response-Format**:
```json
{
  "success": true,
  "emails": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "totalPages": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Aufgabe 3: Frontend-Pagination implementieren

Implementiere die Pagination-Komponente im Frontend (`EmailsView.vue`):

- Verwende die neue `/api/emails/paginated` Route
- Zeige Pagination-Controls (Vorherige/Nächste Seite, Seitenzahlen)
- Aktualisiere die Tabelle bei Seitenwechsel
- Zeige die Pagination-Informationen an

### Wichtige Hinweise

- **NICHT ändern**: Die Datei `src/services/emailProviderService.ts` sollte nicht verändert werden. Sie simuliert den externen Provider.
- **Scheduling**: Überlege dir eine Strategie, wie du das Rate-Limiting umgehst. Mögliche Ansätze:
  - Queue-System (z.B. mit Intervallen)
  - Batch-Processing mit Delays
  - Worker-Pattern
- **Datenbank-Performance**: Achte auf effiziente Datenbank-Queries, besonders wenn viele Emails verarbeitet werden.
- **Fehlerbehandlung**: Was passiert, wenn der Provider temporär nicht erreichbar ist? Wie gehst du mit Teilfehlern um?
- **Socket.IO**: Nach dem Senden von Emails soll über Socket.IO ein Event gesendet werden, damit das Frontend die Tabelle aktualisieren kann.
- **Pagination**: Zeige, dass du verstehst, wie Pagination funktioniert. Implementiere sowohl Backend- als auch Frontend-Logik.

## Erwartete Lösung

### Backend

1. **Email-Sending-Service** (`src/services/emailSendingService.ts`):
   - Lädt pending Emails aus der Datenbank
   - Verarbeitet diese in Batches von maximal 100 pro Sekunde
   - Speichert Ergebnisse korrekt in der Datenbank
   - Sendet Socket.IO Events bei Updates
   - Optional: Automatisches Scheduling

2. **API-Endpunkt** (`POST /api/emails/send-pending`):
   - Startet den Sending-Prozess
   - Gibt Status zurück

3. **Pagination-Route** (`GET /api/emails/paginated`):
   - Implementiere die Route im `emailController.ts`
   - Gibt paginierte Ergebnisse mit Metadaten zurück

### Frontend

1. **Pagination-Komponente** in `EmailsView.vue`:
   - Verwende die `/api/emails/paginated` Route
   - Zeige Pagination-Controls
   - Handle Seitenwechsel

## Bonus-Aufgaben (Optional)

- ✅ Implementiere ein Retry-System für fehlgeschlagene Emails
- ✅ Erstelle einen Endpunkt, der den aktuellen Status des Sending-Prozesses zurückgibt
- ✅ Implementiere Logging/Monitoring für den Versand-Prozess
- ✅ Füge Tests hinzu (Unit-Tests oder Integration-Tests)
- ✅ Optimiere die Datenbank-Queries für bessere Performance

## Bewertungskriterien

### Backend
- ✅ Korrekte Implementierung des Rate-Limiting
- ✅ Effiziente Datenbank-Nutzung
- ✅ Sauberer, wartbarer Code
- ✅ Fehlerbehandlung
- ✅ Socket.IO Integration für Real-Time Updates
- ✅ Pagination-Route korrekt implementiert
- ✅ Code-Organisation und Struktur
- ✅ Optional: Tests und Dokumentation

### Frontend
- ✅ Pagination korrekt implementiert
- ✅ Socket.IO Client Integration für Real-Time Updates
- ✅ Sauberer, wartbarer Vue-Code (Composition API)
- ✅ Gute UX (Loading States, Error Handling)
- ✅ Code-Organisation und Struktur

## Abgabe

Bitte sende deine Lösung als Git-Repository oder ZIP-Datei. Stelle sicher, dass:

- Alle Abhängigkeiten in `package.json` aufgelistet sind
- Eine kurze Dokumentation deiner Lösung enthalten ist (z.B. Kommentare im Code oder eine separate Datei)
- Der Code kompilierbar und ausführbar ist

## Fragen?

Bei Fragen zur Aufgabe, wende dich bitte an deinen Ansprechpartner.

Viel Erfolg! 🚀

