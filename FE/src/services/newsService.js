import api from './api';
export const getNews       = (params = {}) => api.get('/news', { params });
export const getNewsBySlug = (slug)         => api.get(`/news/${slug}`);
export const getHomeNews   = ()             => api.get('/news', { params: { show_on_home: true, limit: 4 } });
