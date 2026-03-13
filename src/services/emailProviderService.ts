/**
 * Mock Email Provider Service
 * 
 * Dieser Service simuliert einen externen Email-Provider mit Rate-Limiting.
 * Der Provider erlaubt maximal 100 Emails pro Sekunde.
 * 
 * WICHTIG: Diese Datei sollte NICHT vom Bewerber verändert werden!
 * Der Bewerber muss die Rate-Limit-Logik in einem eigenen Service implementieren.
 */

interface SendEmailResult {
  externalId?: string;
  error?: string;
}
interface Email {
subject: string; toEmail: string; fromEmail: string; body: string
}
// Simuliert Rate-Limiting: Maximal 100 Requests pro Sekunde
const RATE_LIMIT_PER_SECOND = 100;
let requestCount = 0;
let lastResetTime = Date.now();

/**
 * Simuliert das Senden von Emails an den externen Provider
 * @param emails Array von Email-Objekten zum Senden
 * @returns Promise mit Array von externalIds (oder undefined bei Fehler)
 */
export async function sendEmailsToProvider(
  emails: Email[]
): Promise<(string | undefined)[]> {
  // Rate-Limiting Simulation
  const now = Date.now();
  const timeSinceLastReset = now - lastResetTime;
  
  if (timeSinceLastReset >= 1000) {
    // Eine Sekunde vergangen, Reset Counter
    requestCount = 0;
    lastResetTime = now;
  }
  
  if (requestCount >= RATE_LIMIT_PER_SECOND) {
    // Rate-Limit erreicht - simuliere Fehler
    throw new Error(`Rate limit exceeded: Maximum ${RATE_LIMIT_PER_SECOND} requests per second`);
  }
  
  // Simuliere Netzwerk-Latenz
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
  
  // Erhöhe Request-Counter
  requestCount += emails.length;
  
  // Simuliere zufällige Erfolgs-/Fehlerrate (90% Erfolg)
  const results: (string | undefined)[] = emails.map(() => {
    if (Math.random() < 0.9) {
      // Erfolg: Generiere zufällige externalId
      return `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } else {
      // Fehler: Keine externalId zurückgegeben
      return undefined;
    }
  });
  
  return results;
}

/**
 * Hilfsfunktion zum Zurücksetzen des Rate-Limit-Counters (für Tests)
 */
export function resetRateLimitCounter(): void {
  requestCount = 0;
  lastResetTime = Date.now();
}

