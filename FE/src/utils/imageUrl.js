/**
 * Bangun URL gambar dari path relatif atau absolut.
 */
export const getImageUrl = (path) => {
  if (!path) return '/placeholder.png';
  if (
    path.startsWith('http') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Normalisasi path
  let clean = path;
  if (clean.startsWith('/api')) {
    clean = clean.replace('/api', '');
  }
  if (!clean.startsWith('/uploads')) {
    clean = clean.startsWith('/') ? `/uploads${clean}` : `/uploads/${clean}`;
  }

  if (import.meta.env.DEV) {
    return `http://localhost:5000${clean}`;
  }
  return clean;
};
