// import { defineStore } from 'pinia';
// import { ref } from 'vue';
// import api from '../services/api';
// import { connectSocket, disconnectSocket } from '../services/socket';
// import type { Email } from '@/services/emailService';

// interface User {
//   id: string;
//   username: string;
// }

// export const useEmailStore = defineStore('email', () => {
//   const emails = ref<Email | null>(null);

//   const sendEmails = async (username: string, password: string) => {
//     try {
//       const response = await api.post('/emails/send-emails');
//     //   const { token: newToken, user: userData } = response.data;

//     //   token.value = newToken;
//     //   user.value = userData;
//     //   isAuthenticated.value = true;

//     //   localStorage.setItem('token', newToken);
//     //   localStorage.setItem('user', JSON.stringify(userData));

//     //   // Verbinde Socket.IO
//     //   connectSocket(newToken);

//       return { success: true };
//     } catch (error: any) {
//       return {
//         success: false,
//         message: error.response?.data?.message || 'Registrierung fehlgeschlagen'
//       };
//     }
//   };

//   // Verbinde Socket.IO beim Laden wenn bereits eingeloggt
// //   if (token.value) {
// //     connectSocket(token.value);
// //   }j

//   return {
//     // user,
//     // token,
//     // isAuthenticated,
//     sendEmails,
//     emails
//   };
// });
