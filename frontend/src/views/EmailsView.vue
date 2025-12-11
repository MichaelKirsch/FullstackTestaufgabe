<template>
  <div class="emails-container">
    <header class="header">
      <h1>Email Übersicht</h1>
      <div class="header-actions">
        <span class="user-info">Angemeldet als: {{ authStore.user?.username }}</span>
        <button @click="handleLogout" class="logout-button">Abmelden</button>
      </div>
    </header>

    <div class="actions-bar">
      <button @click="createBatchEmails" :disabled="loading" class="action-button">
        {{ loading ? 'Wird erstellt...' : '1000 Emails erstellen' }}
      </button>
      <button @click="sendPendingEmails" :disabled="sending" class="action-button">
        {{ sending ? 'Wird gesendet...' : 'Pending Emails senden' }}
      </button>
      <div class="stats">
        <span>Total: {{ stats.total || 0 }}</span>
        <span>Pending: {{ stats.pending || 0 }}</span>
        <span>Sent: {{ stats.sent || 0 }}</span>
        <span>Failed: {{ stats.failed || 0 }}</span>
      </div>
    </div>

    <div class="filters">
      <select v-model="selectedStatus" @change="loadEmails" class="filter-select">
        <option value="">Alle Status</option>
        <option value="pending">Pending</option>
        <option value="sent">Sent</option>
        <option value="failed">Failed</option>
      </select>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading && emails.length === 0" class="loading">
      Lädt...
    </div>

    <div v-else>
      <!-- TODO: Implementiere hier die Pagination -->
      <!-- Der Bewerber soll die Pagination-Route /api/emails/paginated verwenden -->
      <!-- und hier eine Pagination-Komponente erstellen -->
      
      <div class="pagination-info">
        <p>⚠️ Pagination muss noch implementiert werden!</p>
        <p>Verwende die Route: GET /api/emails/paginated?page=1&limit=20</p>
      </div>

      <table class="emails-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>An</th>
            <th>Von</th>
            <th>Status</th>
            <th>Erstellt</th>
            <th>Gesendet</th>
            <th>External ID</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="email in emails" :key="email._id" :class="`status-${email.status}`">
            <td>{{ email.subject }}</td>
            <td>{{ email.toEmail }}</td>
            <td>{{ email.fromEmail }}</td>
            <td>
              <span :class="`status-badge status-${email.status}`">
                {{ email.status }}
              </span>
            </td>
            <td>{{ formatDate(email.createdAt) }}</td>
            <td>{{ email.sentAt ? formatDate(email.sentAt) : '-' }}</td>
            <td>{{ email.externalId || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="emails.length === 0" class="empty-state">
        Keine Emails gefunden
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { emailService, type Email } from '@/services/emailService';
import { getSocket } from '@/services/socket';

const router = useRouter();
const authStore = useAuthStore();

const emails = ref<Email[]>([]);
const loading = ref(false);
const sending = ref(false);
const error = ref('');
const selectedStatus = ref('');
const stats = ref({
  total: 0,
  pending: 0,
  sent: 0,
  failed: 0
});

const loadEmails = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // TODO: Verwende getPaginated statt getAll
    // const response = await emailService.getPaginated(1, 20, selectedStatus.value);
    // emails.value = response.emails;
    
    // Temporär: Verwende getAll bis Pagination implementiert ist
    const response = await emailService.getAll(100, 0, selectedStatus.value || undefined);
    emails.value = response.emails;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Fehler beim Laden der Emails';
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const response = await emailService.getStats();
    stats.value = {
      total: response.total,
      pending: response.stats.pending || 0,
      sent: response.stats.sent || 0,
      failed: response.stats.failed || 0
    };
  } catch (err) {
    console.error('Fehler beim Laden der Statistiken:', err);
  }
};

const createBatchEmails = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await emailService.createBatch();
    await loadEmails();
    await loadStats();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Fehler beim Erstellen der Emails';
  } finally {
    loading.value = false;
  }
};

const sendPendingEmails = async () => {
  sending.value = true;
  error.value = '';
  
  try {
    // TODO: Implementiere den Email-Sending-Endpunkt
    // Dieser sollte die Rate-Limiting-Logik enthalten
    error.value = 'Email-Sending-Endpunkt muss noch implementiert werden!';
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Fehler beim Senden der Emails';
  } finally {
    sending.value = false;
  }
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('de-DE');
};

// Socket.IO Listener für Email-Updates
const setupSocketListener = () => {
  const socket = getSocket();
  if (socket) {
    socket.on('email:update', () => {
      // Lade Emails neu wenn Update empfangen wird
      loadEmails();
      loadStats();
    });
  }
};

onMounted(() => {
  loadEmails();
  loadStats();
  setupSocketListener();
});

onUnmounted(() => {
  const socket = getSocket();
  if (socket) {
    socket.off('email:update');
  }
});
</script>

<style scoped>
.emails-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

h1 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  color: #666;
  font-size: 14px;
}

.logout-button {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.logout-button:hover {
  background: #c82333;
}

.actions-bar {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.action-button {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.action-button:hover:not(:disabled) {
  background: #5568d3;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats {
  display: flex;
  gap: 20px;
  margin-left: auto;
  font-size: 14px;
  color: #666;
}

.stats span {
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.filters {
  margin-bottom: 20px;
}

.filter-select {
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.pagination-info {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #856404;
}

.pagination-info p {
  margin: 5px 0;
}

.emails-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.emails-table thead {
  background: #667eea;
  color: white;
}

.emails-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
}

.emails-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
}

.emails-table tbody tr:hover {
  background: #f8f9fa;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-sent {
  background: #d4edda;
  color: #155724;
}

.status-failed {
  background: #f8d7da;
  color: #721c24;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>

