const { query }              = require('../config/db');
const { sendSuccess, sendError } = require('../utils/helpers');

exports.getAll = async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM testimonials WHERE is_active = true ORDER BY created_at DESC'
    );
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { client_name, client_title, client_company, content, rating = 5, avatar } = req.body;

    if (!client_name?.trim() || !content?.trim()) {
      return sendError(res, 'Nama klien dan isi testimoni wajib diisi.', 422);
    }

    const result = await query(
      `INSERT INTO testimonials (client_name, client_title, client_company, content, rating, avatar)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [client_name.trim(), client_title, client_company, content.trim(), rating, avatar]
    );

    return sendSuccess(res, result.rows[0], 'Testimoni berhasil ditambahkan.', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { client_name, client_title, client_company, content, rating, avatar, is_active } = req.body;

    const result = await query(
      `UPDATE testimonials
       SET client_name = $1, client_title = $2, client_company = $3,
           content = $4, rating = $5, avatar = $6, is_active = $7
       WHERE id = $8
       RETURNING *`,
      [client_name, client_title, client_company, content, rating, avatar, is_active !== false, req.params.id]
    );

    if (!result.rows.length) {
      return sendError(res, 'Testimoni tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0], 'Testimoni berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await query('UPDATE testimonials SET is_active = false WHERE id = $1', [req.params.id]);
    return sendSuccess(res, null, 'Testimoni berhasil dihapus.');
  } catch (err) {
    next(err);
  }
};
