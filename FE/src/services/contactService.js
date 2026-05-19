import api from './api';
export const submitContact = (data) => api.post('/contact', data);
export const submitRFQ     = (data) => api.post('/rfq', data);
