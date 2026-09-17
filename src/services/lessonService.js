import api from './api';

export const lessonService = {
  getAll(courseSlug, params = {}) {
    return api.get(`/courses/${courseSlug}/lessons`, { params });
  },

  getById(courseSlug, lessonId) {
    return api.get(`/courses/${courseSlug}/lessons/${lessonId}`);
  },

  create(courseSlug, data) {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        if ((key === 'video' || key === 'audio') && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    return api.post(`/courses/${courseSlug}/lessons`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update(courseSlug, lessonId, data) {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        if ((key === 'video' || key === 'audio') && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else {
          formData.append(key, data[key]);
        }
      }
    });

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

  updateAvailability(courseSlug, lessonId, availability) {
    return api.put(`/courses/${courseSlug}/lessons/${lessonId}/availability`, { availability });
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
