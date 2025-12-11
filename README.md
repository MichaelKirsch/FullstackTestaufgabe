# Fullstack Developer Testaufgabe - Email Rate Limiting

## Übersicht

Diese Aufgabe testet deine Fähigkeiten im Umgang mit Datenbanken, der Verarbeitung großer Datenmengen und der Implementierung von Rate-Limiting-Strategien. Du wirst ein System entwickeln, das 1000 Emails gleichzeitig verarbeitet, während ein externer Email-Provider nur 100 Emails pro Sekunde akzeptiert.

## Technologie-Stack

- **Backend**: TypeScript + Express.js
- **Datenbank**: MongoDB (mit Mongoose)
- **Node.js**: Version 18 oder höher empfohlen

## Projekt-Setup

### Voraussetzungen

- Node.js (v18 oder höher)
- MongoDB (lokal installiert oder MongoDB Atlas Account)
- npm oder yarn

### Installation

1. Repository klonen oder herunterladen
2. Abhängigkeiten installieren:
```bash
npm install
```

3. Umgebungsvariablen konfigurieren:
Erstelle eine `.env` Datei im Root-Verzeichnis:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/email-test
NODE_ENV=development
```

4. MongoDB starten (falls lokal):
```bash
# macOS mit Homebrew
brew services start mongodb-community

# Oder manuell
mongod
```

5. Server starten:
```bash
npm run dev
```

Der Server läuft dann auf `http://localhost:3000`

## Datenbank-Schema

Das Email-Modell hat folgende Felder:

- `subject` (String, required): Betreff der Email
- `toEmail` (String, required): Empfänger-Email-Adresse
- `fromEmail` (String, required): Absender-Email-Adresse
- `body` (String, required): Inhalt der Email
- `status` (Enum: 'pending' | 'sent' | 'failed', default: 'pending'): Status der Email
- `createdAt` (Date, default: now): Erstellungszeitpunkt
- `sentAt` (Date, optional): Zeitpunkt des Versands
- `error` (String, optional): Fehlermeldung bei fehlgeschlagenem Versand
- `externalId` (String, optional): ID vom externen Email-Provider (wird nach erfolgreichem Versand gesetzt)
- `ownerId` (String, required): ID des Besitzers/Erstellers

## Verfügbare API-Endpunkte

### 1. Batch-Emails erstellen
```
POST /api/emails/create-batch
Body: { "ownerId": "optional-owner-id" }
```
Erstellt 1000 Email-Einträge in der Datenbank mit Status 'pending'.

### 2. Alle Emails abrufen
```
GET /api/emails?status=pending&ownerId=xxx&limit=100&skip=0
```

### 3. Einzelne Email abrufen
```
GET /api/emails/:id
```

### 4. Statistiken abrufen
```
GET /api/emails/stats
```
Gibt eine Übersicht über die Anzahl der Emails pro Status zurück.

## Die Herausforderung

### Problemstellung

1. **1000 Emails gleichzeitig erstellen**: Über den Endpunkt `/api/emails/create-batch` werden 1000 Email-Einträge in der Datenbank erstellt.

2. **Rate-Limiting des Providers**: Der externe Email-Provider (`emailProviderService.ts`) erlaubt maximal **100 Emails pro Sekunde**. Wenn du versuchst, mehr zu senden, wirft der Service einen Fehler.

3. **Provider-API**: Die Funktion `sendEmailsToProvider()` akzeptiert ein Array von Email-Objekten und gibt ein Array zurück mit:
   - `string` (externalId) bei Erfolg
   - `undefined` bei Fehler

### Deine Aufgabe

Implementiere einen **Email-Sending-Service**, der:

1. ✅ Alle pending Emails aus der Datenbank lädt
2. ✅ Diese in Batches von maximal 100 Emails pro Sekunde an den Provider sendet
3. ✅ Die Ergebnisse verarbeitet und in der Datenbank aktualisiert:
   - Bei Erfolg: `status = 'sent'`, `externalId` setzen, `sentAt` setzen
   - Bei Fehler: `status = 'failed'`, `error` setzen
4. ✅ Ein Scheduling-System implementiert, das kontinuierlich pending Emails verarbeitet
5. ✅ Fehlerbehandlung und Retry-Logik berücksichtigt

### Wichtige Hinweise

- **NICHT ändern**: Die Datei `src/services/emailProviderService.ts` sollte nicht verändert werden. Sie simuliert den externen Provider.
- **Scheduling**: Überlege dir eine Strategie, wie du das Rate-Limiting umgehst. Mögliche Ansätze:
  - Queue-System (z.B. mit Intervallen)
  - Batch-Processing mit Delays
  - Worker-Pattern
- **Datenbank-Performance**: Achte auf effiziente Datenbank-Queries, besonders wenn viele Emails verarbeitet werden.
- **Fehlerbehandlung**: Was passiert, wenn der Provider temporär nicht erreichbar ist? Wie gehst du mit Teilfehlern um?

## Erwartete Lösung

Erstelle einen neuen Service (z.B. `src/services/emailSendingService.ts`) und einen neuen API-Endpunkt (z.B. `POST /api/emails/send-pending`), der:

1. Pending Emails aus der Datenbank lädt
2. Diese in Batches von maximal 100 pro Sekunde verarbeitet
3. Die Ergebnisse korrekt in der Datenbank speichert
4. Optional: Ein automatisches Scheduling implementiert, das regelmäßig pending Emails verarbeitet

## Bonus-Aufgaben (Optional)

- ✅ Implementiere ein Retry-System für fehlgeschlagene Emails
- ✅ Erstelle einen Endpunkt, der den aktuellen Status des Sending-Prozesses zurückgibt
- ✅ Implementiere Logging/Monitoring für den Versand-Prozess
- ✅ Füge Tests hinzu (Unit-Tests oder Integration-Tests)
- ✅ Optimiere die Datenbank-Queries für bessere Performance

## Bewertungskriterien

- ✅ Korrekte Implementierung des Rate-Limiting
- ✅ Effiziente Datenbank-Nutzung
- ✅ Sauberer, wartbarer Code
- ✅ Fehlerbehandlung
- ✅ Code-Organisation und Struktur
- ✅ Optional: Tests und Dokumentation

## Abgabe

Bitte sende deine Lösung als Git-Repository oder ZIP-Datei. Stelle sicher, dass:

- Alle Abhängigkeiten in `package.json` aufgelistet sind
- Eine kurze Dokumentation deiner Lösung enthalten ist (z.B. Kommentare im Code oder eine separate Datei)
- Der Code kompilierbar und ausführbar ist

## Fragen?

Bei Fragen zur Aufgabe, wende dich bitte an deinen Ansprechpartner.

Viel Erfolg! 🚀

