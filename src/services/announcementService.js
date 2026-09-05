import api from './api';

export const announcementService = {
  getAll(params = {}) {
    return api.get('/announcements', { params });
  },

  getById(id) {
    return api.get(`/announcements/${id}`);
  },

  create(data) {
    return api.post('/announcements', data);
  },

  update(id, data) {
    return api.put(`/announcements/${id}`, data);
  },

  delete(id) {
    return api.delete(`/announcements/${id}`);
  },

  publish(id) {
    return api.post(`/announcements/${id}/publish`);
  },

  unpublish(id) {
    return api.post(`/announcements/${id}/unpublish`);
  },

  getNotificationHistory(params = {}) {
    return api.get('/announcements/history', { params });
  },
};
