const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const API = {
  async request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
    });
    if (!response.ok) {
      let detail = 'Request failed';
      try {
        const payload = await response.json();
        detail = payload.detail || detail;
      } catch (_) {}
      throw new Error(detail);
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    return response.text();
  },

  formData(data) {
    const body = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) body.append(key, value);
    });
    return body;
  },

  getMe() { return this.request('/api/me'); },
  login(data) { return this.request('/api/auth/login', { method: 'POST', body: this.formData(data) }); },
  register(data) { return this.request('/api/auth/register', { method: 'POST', body: this.formData(data) }); },
  logout() { return this.request('/api/auth/logout', { method: 'POST' }); },
  dashboard() { return this.request('/api/dashboard'); },
  exercises() { return this.request('/api/exercises'); },
  templates() { return this.request('/api/templates'); },
  voiceTips() { return this.request('/api/voice-tips'); },
  history() { return this.request('/api/history'); },
  saveSession(payload) { return this.request('/api/session/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); },
  createManual(data) { return this.request('/api/history/manual', { method: 'POST', body: this.formData(data) }); },
  deleteSession(id) { return this.request(`/api/history/${id}`, { method: 'DELETE' }); },
  profile() { return this.request('/api/profile'); },
  updateProfile(data) { return this.request('/api/profile', { method: 'POST', body: this.formData(data) }); },
};

export default API;
