/**
 * Ambil pesan error dari axios error atau string biasa.
 */
export const getErrorMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Terjadi kesalahan.';

/**
 * Bangun URL gambar dari path relatif.
 * - Jika sudah full URL (http/https/blob/data), kembalikan apa adanya.
 * - Jika path relatif, tambahkan /uploads/ di depannya.
 */
export const imgUrl = (path) => {
  if (!path) return '';
  if (
    path.startsWith('http') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  const clean = path.startsWith('/uploads')
    ? path
    : `/uploads/${path}`;

  if (import.meta.env.DEV) {
    return `http://localhost:5000${clean}`;
  }
  return clean;
};

/**
 * Format tanggal ke format Indonesia singkat (mis. "12 Jan 2025").
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  }).format(new Date(dateStr));
};

/**
 * Ubah string menjadi URL slug.
 */
export const toSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};
