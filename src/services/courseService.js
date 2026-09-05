import api from './api';

export const courseService = {
  getAll(params = {}) {
    return api.get('/courses', { params });
  },

  getById(slug) {
    return api.get(`/courses/${slug}`);
  },

  create(data) {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        if (key === 'thumbnail' && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    return api.post('/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update(slug, data) {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        if (key === 'thumbnail' && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    return api.post(`/courses/${slug}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete(slug) {
    return api.delete(`/courses/${slug}`);
  },

  publish(slug) {
    return api.post(`/courses/${slug}/publish`);
  },

  unpublish(slug) {
    return api.post(`/courses/${slug}/unpublish`);
  },

  archive(slug) {
    return api.post(`/courses/${slug}/archive`);
  },

  updateStatus(slug, status) {
    return api.put(`/courses/${slug}/status`, { status });
  },

  getCategories() {
    return api.get('/courses/categories');
  },
};

export const categoryService = {
  getAll(params = {}) {
    return api.get('/categories', { params });
  },

  getById(slug) {
    return api.get(`/categories/${slug}`);
  },

  create(data) {
    return api.post('/categories', data);
  },

  update(slug, data) {
    return api.put(`/categories/${slug}`, data);
  },

  delete(slug) {
    return api.delete(`/categories/${slug}`);
  },
};
