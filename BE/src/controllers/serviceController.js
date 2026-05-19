const { query }              = require('../config/db');
const { sendSuccess, sendError, toSlug } = require('../utils/helpers');

exports.getAll = async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM services WHERE is_active = true ORDER BY sort_order ASC, name ASC'
    );
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM services WHERE slug = $1 AND is_active = true',
      [req.params.slug]
    );

    if (!result.rows.length) {
      return sendError(res, 'Layanan tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, scope, icon, image, sort_order = 0 } = req.body;

    if (!name?.trim()) {
      return sendError(res, 'Nama layanan wajib diisi.', 422);
    }

    const slug   = `${toSlug(name)}-${Date.now()}`;
    const result = await query(
      `INSERT INTO services (name, slug, description, scope, icon, image, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name.trim(), slug, description, scope, icon, image, sort_order]
    );

    return sendSuccess(res, result.rows[0], 'Layanan berhasil ditambahkan.', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, description, scope, icon, image, is_active, sort_order } = req.body;

    const result = await query(
      `UPDATE services
       SET name = $1, description = $2, scope = $3, icon = $4,
           image = $5, is_active = $6, sort_order = $7
       WHERE id = $8
       RETURNING *`,
      [name, description, scope, icon, image, is_active !== false, sort_order || 0, req.params.id]
    );

    if (!result.rows.length) {
      return sendError(res, 'Layanan tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0], 'Layanan berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await query('UPDATE services SET is_active = false WHERE id = $1', [req.params.id]);
    return sendSuccess(res, null, 'Layanan berhasil dihapus.');
  } catch (err) {
    next(err);
  }
};
