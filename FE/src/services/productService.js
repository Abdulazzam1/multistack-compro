import api from './api';
export const getProducts   = (params = {}) => api.get('/products',        { params });
export const getProductBySlug = (slug)       => api.get(`/products/${slug}`);
export const getCategories = (params = {}) => api.get('/categories',     { params });
