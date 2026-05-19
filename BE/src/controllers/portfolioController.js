const { query }              = require('../config/db');
const { sendSuccess, sendError, toSlug } = require('../utils/helpers');

exports.getAll = async (req, res, next) => {
  try {
    const { category, show_on_home, featured } = req.query;

    let q = 'SELECT * FROM portfolio WHERE is_active = true';
    const p = [];

    if (category) {
      p.push(category);
      q += ` AND category = $${p.length}`;
    }
    if (show_on_home === 'true') {
      p.push(true);
      q += ` AND show_on_home = $${p.length}`;
    }
    if (featured === 'true') {
      p.push(true);
      q += ` AND is_featured = $${p.length}`;
    }

    q += ' ORDER BY year DESC, created_at DESC';

    const result = await query(q, p);
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM portfolio WHERE slug = $1 AND is_active = true',
      [req.params.slug]
    );

    if (!result.rows.length) {
      return sendError(res, 'Portfolio tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      title,
      client,
      location,
      category,
      description,
      scope,
      images      = [],
      year,
      is_featured = false,
      show_on_home = false,
    } = req.body;

    if (!title?.trim()) {
      return sendError(res, 'Judul portfolio wajib diisi.', 422);
    }

    const slug   = `${toSlug(title)}-${Date.now()}`;
    const result = await query(
      `INSERT INTO portfolio
         (title, slug, client, location, category, description, scope, images, year, is_featured, show_on_home)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title.trim(), slug, client, location, category, description, scope, images, year, is_featured, show_on_home]
    );

    return sendSuccess(res, result.rows[0], 'Portfolio berhasil ditambahkan.', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const {
      title,
      client,
      location,
      category,
      description,
      scope,
      images,
      year,
      is_featured,
      is_active,
      show_on_home,
    } = req.body;

    const result = await query(
      `UPDATE portfolio
       SET title = $1, client = $2, location = $3, category = $4,
           description = $5, scope = $6, images = $7, year = $8,
           is_featured = $9, is_active = $10, show_on_home = $11
       WHERE id = $12
       RETURNING *`,
      [title, client, location, category, description, scope, images || [], year, is_featured, is_active !== false, show_on_home, req.params.id]
    );

    if (!result.rows.length) {
      return sendError(res, 'Portfolio tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0], 'Portfolio berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await query('UPDATE portfolio SET is_active = false WHERE id = $1', [req.params.id]);
    return sendSuccess(res, null, 'Portfolio berhasil dihapus.');
  } catch (err) {
    next(err);
  }
};
