/**
 * Kirim response sukses dengan format standar.
 */
const sendSuccess = (res, data, message = 'Berhasil', status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

/**
 * Kirim response error dengan format standar.
 */
const sendError = (res, message = 'Terjadi kesalahan', status = 400) => {
  return res.status(status).json({ success: false, message });
};

/**
 * Ubah string menjadi URL slug (lowercase, huruf & angka, pisah dengan -).
 */
const toSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

module.exports = { sendSuccess, sendError, toSlug };
