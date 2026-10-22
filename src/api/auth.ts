import { fetchClient } from './client';

export const authApi = {
  login: async (email: string, firebaseToken: string) => {
    try {
      const res = await fetchClient<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, firebaseToken }),
      });
      if (res?.token) return res;
    } catch (e) {
      console.warn('API login error, using local fallback', e);
    }

    // Fallback simulation for local and demo sessions
    return {
      token: `demo_jwt_${Date.now()}_${btoa(email || 'traveler')}`,
      user: {
        id: 'usr_me',
        email: email || 'alex.traveler@wakeru.local',
        name: email.includes('vendor') ? 'Vikram Joshi' : email.includes('admin') ? 'Admin Moderator' : 'Alex Traveler',
        role: email.includes('vendor') ? 'VENDOR' : email.includes('admin') ? 'ADMIN' : 'TRAVELER',
      },
    };
  },

  getMe: async () => {
    try {
      const res = await fetchClient<{ user: any }>('/auth/me');
      if (res?.user) return res.user;
    } catch {}
    return null;
  },
};
