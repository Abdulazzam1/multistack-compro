import api from './api';
export const getServices      = () => api.get('/services');
export const getServiceBySlug = (slug) => api.get(`/services/${slug}`);
