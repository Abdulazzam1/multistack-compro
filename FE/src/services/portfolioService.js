import api from './api';
export const getPortfolios     = (params = {}) => api.get('/portfolio', { params });
export const getPortfolioBySlug = (slug)        => api.get(`/portfolio/${slug}`);
