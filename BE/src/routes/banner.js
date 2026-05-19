const express            = require('express');
const router             = express.Router();
const auth               = require('../middleware/auth');
const { query }          = require('../config/db');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/banner — ambil semua banner aktif
router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM banners WHERE is_active = true ORDER BY sort_order ASC'
    );
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/banner — tambah banner baru (admin)
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, image_url, link_url, sort_order = 0 } = req.body;

    if (!image_url) {
      return sendError(res, 'URL gambar wajib diisi.', 422);
    }

    const result = await query(
      `INSERT INTO banners (title, image_url, link_url, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, image_url, link_url, sort_order]
    );

    return sendSuccess(res, result.rows[0], 'Banner berhasil ditambahkan.', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/banner/:id — update banner (admin)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { title, image_url, link_url, is_active, sort_order } = req.body;

    const result = await query(
      `UPDATE banners
       SET title = $1, image_url = $2, link_url = $3, is_active = $4, sort_order = $5
       WHERE id = $6
       RETURNING *`,
      [title, image_url, link_url, is_active !== false, sort_order || 0, req.params.id]
    );

    if (!result.rows.length) {
      return sendError(res, 'Banner tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0], 'Banner berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/banner/:id — hapus banner (soft delete, admin)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    await query('UPDATE banners SET is_active = false WHERE id = $1', [req.params.id]);
    return sendSuccess(res, null, 'Banner berhasil dihapus.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
