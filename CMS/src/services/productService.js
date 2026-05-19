import api from './api';
export const getProducts   = (params) => api.get('/products', { params: { ...params, published: 'all' } });
export const getProduct    = (id)      => api.get(`/products/${id}`);
export const createProduct = (data)    => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id)       => api.delete(`/products/${id}`);
export const uploadImage   = (id, file) => {
  const fd = new FormData(); fd.append('image', file);
  return api.post(`/products/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
