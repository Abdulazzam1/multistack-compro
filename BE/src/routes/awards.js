const express            = require('express');
const router             = express.Router();
const auth               = require('../middleware/auth');
const { query }          = require('../config/db');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/awards
router.get('/', async (req, res, next) => {
  try {
    const { type, show_on_home } = req.query;

    let q = 'SELECT * FROM awards_certifications WHERE is_active = true';
    const p = [];

    if (type) {
      p.push(type);
      q += ` AND type = $${p.length}`;
    }
    if (show_on_home === 'true') {
      p.push(true);
      q += ` AND show_on_home = $${p.length}`;
    }

    q += ' ORDER BY sort_order ASC, year DESC';

    const result = await query(q, p);
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/awards (admin)
router.post('/', auth, async (req, res, next) => {
  try {
    const {
      type         = 'penghargaan',
      title,
      image_url,
      issued_by,
      year,
      description,
      show_on_home = false,
      sort_order   = 0,
    } = req.body;

    if (!title?.trim()) {
      return sendError(res, 'Judul wajib diisi.', 422);
    }

    const result = await query(
      `INSERT INTO awards_certifications
         (type, title, image_url, issued_by, year, description, show_on_home, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [type, title.trim(), image_url, issued_by, year, description, show_on_home, sort_order]
    );

    return sendSuccess(res, result.rows[0], 'Data berhasil ditambahkan.', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/awards/:id (admin)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const {
      type, title, image_url, issued_by, year,
      description, show_on_home, sort_order, is_active,
    } = req.body;

    const result = await query(
      `UPDATE awards_certifications
       SET type = $1, title = $2, image_url = $3, issued_by = $4,
           year = $5, description = $6, show_on_home = $7,
           sort_order = $8, is_active = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [type, title, image_url, issued_by, year, description, show_on_home, sort_order || 0, is_active !== false, req.params.id]
    );

    if (!result.rows.length) {
      return sendError(res, 'Data tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0], 'Data berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/awards/:id (admin)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    await query(
      'UPDATE awards_certifications SET is_active = false WHERE id = $1',
      [req.params.id]
    );
    return sendSuccess(res, null, 'Data berhasil dihapus.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
