import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

interface User {
  id: string;
  username: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isAuthenticated = ref<boolean>(!!token.value);

  // Lade User aus localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token: newToken, user: userData } = response.data;

      token.value = newToken;
      user.value = userData;
      isAuthenticated.value = true;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Verbinde Socket.IO
      connectSocket(newToken);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login fehlgeschlagen'
      };
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, password });
      const { token: newToken, user: userData } = response.data;

      token.value = newToken;
      user.value = userData;
      isAuthenticated.value = true;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Verbinde Socket.IO
      connectSocket(newToken);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registrierung fehlgeschlagen'
      };
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
  };

  // Verbinde Socket.IO beim Laden wenn bereits eingeloggt
  if (token.value) {
    connectSocket(token.value);
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout
  };
});

