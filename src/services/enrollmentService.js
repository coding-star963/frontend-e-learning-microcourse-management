import api from './api';

export const enrollmentService = {
  getAll(params = {}) {
    return api.get('/enrollments', { params });
  },

  getById(id) {
    return api.get(`/enrollments/${id}`);
  },

  create(data) {
    return api.post('/enrollments', data);
  },

  update(id, data) {
    return api.put(`/enrollments/${id}`, data);
  },

  delete(id) {
    return api.delete(`/enrollments/${id}`);
  },

  getStats() {
    return api.get('/enrollments/stats');
  },

  getCourseEnrollments(courseSlug, params = {}) {
    return api.get(`/enrollments/course/${courseSlug}`, { params });
  },

  getCourseStats(courseSlug) {
    return api.get(`/enrollments/course/${courseSlug}/stats`);
  },

  getStudentEnrollments(userId, params = {}) {
    return api.get(`/enrollments/student/${userId}`, { params });
  },
};
