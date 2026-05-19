import api from './api';
export const getRFQs   = (params) => api.get('/admin/rfq', { params });
export const markRFQ   = (id, data) => api.patch(`/admin/rfq/${id}/read`, data);
