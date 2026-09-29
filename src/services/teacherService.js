import api from './api';

export const teacherService = {
  getAll(params = {}) {
    return api.get('/teachers', { params });
  },
};
