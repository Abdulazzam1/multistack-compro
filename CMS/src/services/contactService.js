import api from './api';
export const getContacts   = (params)   => api.get('/admin/contact', { params });
export const markContact   = (id)       => api.patch(`/admin/contact/${id}/read`);
