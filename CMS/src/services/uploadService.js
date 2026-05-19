import api from './api';
export const uploadFile = (file, folder = 'general') => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  return api.post('/admin/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
