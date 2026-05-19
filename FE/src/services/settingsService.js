import api from './api';
export const getSettings = () => api.get('/settings');
export const getBanners  = () => api.get('/banner');
