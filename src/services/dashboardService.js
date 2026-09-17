import api from './api';

export const dashboardService = {
  getDashboard() {
    return api.get('/dashboard');
  },
};
