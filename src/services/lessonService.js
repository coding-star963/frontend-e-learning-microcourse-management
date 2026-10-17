import api from './api';

// Multipart form for lesson create/update. Booleans become '1'/'0' because
// Laravel's boolean rule rejects the strings 'true'/'false'.
function toLessonFormData(data, { keepEmpty }) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'video' || key === 'audio') {
      if (value instanceof File) formData.append(key, value);
    } else if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
    } else if (value !== null && value !== undefined && (keepEmpty || value !== '')) {
      formData.append(key, value);
    }
  });
  return formData;
}

export const lessonService = {
  getAll(courseSlug, params = {}) {
    return api.get(`/courses/${courseSlug}/lessons`, { params });
  },

  getById(courseSlug, lessonId) {
    return api.get(`/courses/${courseSlug}/lessons/${lessonId}`);
  },

  create(courseSlug, data) {
    const formData = toLessonFormData(data, { keepEmpty: false });

    return api.post(`/courses/${courseSlug}/lessons`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update(courseSlug, lessonId, data) {
    // Empty strings are sent too, so optional fields (description, duration...) can be cleared.
    const formData = toLessonFormData(data, { keepEmpty: true });
    formData.append('_method', 'PUT');

    return api.post(`/courses/${courseSlug}/lessons/${lessonId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete(courseSlug, lessonId) {
    return api.delete(`/courses/${courseSlug}/lessons/${lessonId}`);
  },

  publish(courseSlug, lessonId) {
    return api.post(`/courses/${courseSlug}/lessons/${lessonId}/publish`);
  },

  unpublish(courseSlug, lessonId) {
    return api.post(`/courses/${courseSlug}/lessons/${lessonId}/unpublish`);
  },

  archive(courseSlug, lessonId) {
    return api.post(`/courses/${courseSlug}/lessons/${lessonId}/archive`);
  },

  updateStatus(courseSlug, lessonId, status) {
    return api.put(`/courses/${courseSlug}/lessons/${lessonId}/status`, { status });
  },

  updateAvailability(courseSlug, lessonId, availability, availableAt = null) {
    return api.put(`/courses/${courseSlug}/lessons/${lessonId}/availability`, {
      availability,
      available_at: availableAt,
    });
  },

  reorder(courseSlug, lessonIds) {
    return api.put(`/courses/${courseSlug}/lessons/reorder`, { lesson_ids: lessonIds });
  },

  addResource(courseSlug, lessonId, file, name) {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    return api.post(`/courses/${courseSlug}/lessons/${lessonId}/resources`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteResource(courseSlug, lessonId, resourceId) {
    return api.delete(`/courses/${courseSlug}/lessons/${lessonId}/resources/${resourceId}`);
  },

  reorderResources(courseSlug, lessonId, resourceIds) {
    return api.put(`/courses/${courseSlug}/lessons/${lessonId}/resources/reorder`, { resource_ids: resourceIds });
  },
};
