const express            = require('express');
const router             = express.Router();
const auth               = require('../middleware/auth');
const { query }          = require('../config/db');
const { sendSuccess, sendError, toSlug } = require('../utils/helpers');

// GET /api/categories — daftar kategori (opsional filter by type)
router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;

    let q = 'SELECT * FROM categories WHERE is_active = true';
    const p = [];

    if (type) {
      p.push(type);
      q += ` AND (type = $${p.length} OR type IS NULL)`;
    }

    q += ' ORDER BY sort_order ASC, name ASC';

    const result = await query(q, p);
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories — tambah kategori (admin)
router.post('/', auth, async (req, res, next) => {
  try {
    const { name, slug, description, icon, sort_order, type } = req.body;

    if (!name?.trim()) {
      return sendError(res, 'Nama kategori wajib diisi.', 422);
    }

    const finalSlug = slug?.trim() || toSlug(name);

    const result = await query(
      `INSERT INTO categories (name, slug, description, icon, sort_order, type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name.trim(), finalSlug, description, icon, sort_order || 0, type || 'product']
    );

    return sendSuccess(res, result.rows[0], 'Kategori berhasil ditambahkan.', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id — update kategori (admin)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { name, slug, description, icon, is_active, sort_order, type } = req.body;

    const finalSlug = slug?.trim() || toSlug(name || '');

    const result = await query(
      `UPDATE categories
       SET name = $1, slug = $2, description = $3, icon = $4,
           is_active = $5, sort_order = $6, type = $7
       WHERE id = $8
       RETURNING *`,
      [name, finalSlug, description, icon, is_active !== false, sort_order || 0, type || 'product', req.params.id]
    );

    if (!result.rows.length) {
      return sendError(res, 'Kategori tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0], 'Kategori berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id — hapus kategori (admin)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    await query('UPDATE categories SET is_active = false WHERE id = $1', [req.params.id]);
    return sendSuccess(res, null, 'Kategori berhasil dihapus.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
