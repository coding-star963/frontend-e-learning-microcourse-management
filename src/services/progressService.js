import api from './api';

export const progressService = {
  getStudentProgress(userId) {
    return api.get(`/progress/student/${userId}`);
  },

  getCourseProgress(courseSlug) {
    return api.get(`/progress/course/${courseSlug}`);
  },

  getEnrollmentProgress(enrollmentId) {
    return api.get(`/progress/enrollment/${enrollmentId}`);
  },

  getLearningHistory(userId, params = {}) {
    return api.get(`/progress/history/${userId}`, { params });
  },

  getCourseProgressSummary(courseSlug) {
    return api.get(`/progress/course/${courseSlug}/summary`);
  },

  toggleLessonProgress(lessonId, data) {
    return api.put(`/lessons/${lessonId}/progress`, data);
  },
};
