const { query }              = require('../config/db');
const { sendSuccess, sendError, toSlug } = require('../utils/helpers');

exports.getAll = async (req, res, next) => {
  try {
    const {
      category,
      show_on_home,
      published = 'true',
      limit     = 20,
      offset    = 0,
    } = req.query;

    let q = 'SELECT * FROM news WHERE 1=1';
    const p = [];

    if (published !== 'all') {
      p.push(true);
      q += ` AND is_published = $${p.length}`;
    }
    if (category) {
      p.push(category);
      q += ` AND category = $${p.length}`;
    }
    if (show_on_home === 'true') {
      p.push(true);
      q += ` AND show_on_home = $${p.length}`;
    }

    q += ' ORDER BY created_at DESC';

    if (limit !== 'all') {
      p.push(parseInt(limit));
      q += ` LIMIT $${p.length}`;
    }

    p.push(parseInt(offset));
    q += ` OFFSET $${p.length}`;

    const result = await query(q, p);
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM news WHERE slug = $1 AND is_published = true',
      [req.params.slug]
    );

    if (!result.rows.length) {
      return sendError(res, 'Berita tidak ditemukan.', 404);
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
      category     = 'berita',
      excerpt,
      content,
      cover_image,
      author       = 'Admin Multistack',
      is_published = false,
      show_on_home = false,
    } = req.body;

    if (!title?.trim()) {
      return sendError(res, 'Judul berita wajib diisi.', 422);
    }

    const slug   = `${toSlug(title)}-${Date.now()}`;
    const result = await query(
      `INSERT INTO news (title, slug, category, excerpt, content, cover_image, author, is_published, show_on_home)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title.trim(), slug, category, excerpt, content, cover_image, author, is_published, show_on_home]
    );

    return sendSuccess(res, result.rows[0], 'Berita berhasil ditambahkan.', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const {
      title,
      category,
      excerpt,
      content,
      cover_image,
      author,
      is_published,
      show_on_home,
    } = req.body;

    const result = await query(
      `UPDATE news
       SET title = $1, category = $2, excerpt = $3, content = $4,
           cover_image = $5, author = $6, is_published = $7,
           show_on_home = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [title, category, excerpt, content, cover_image, author, is_published, show_on_home, req.params.id]
    );

    if (!result.rows.length) {
      return sendError(res, 'Berita tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0], 'Berita berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await query('DELETE FROM news WHERE id = $1', [req.params.id]);
    return sendSuccess(res, null, 'Berita berhasil dihapus.');
  } catch (err) {
    next(err);
  }
};
