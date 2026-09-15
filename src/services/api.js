import mockApi from './mockApi';

const api = mockApi.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default api;
