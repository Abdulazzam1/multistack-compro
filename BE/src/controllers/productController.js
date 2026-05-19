const { query }              = require('../config/db');
const { sendSuccess, sendError, toSlug } = require('../utils/helpers');

// ── Ambil semua produk ─────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      featured,
      search,
      limit  = 50,
      offset = 0,
    } = req.query;

    let q = 'SELECT * FROM products WHERE is_active = true';
    const p = [];

    if (category) {
      p.push(category);
      q += ` AND category = $${p.length}`;
    }
    if (brand) {
      p.push(`%${brand}%`);
      q += ` AND brand ILIKE $${p.length}`;
    }
    if (featured === 'true') {
      p.push(true);
      q += ` AND is_featured = $${p.length}`;
    }
    if (search) {
      p.push(`%${search}%`);
      q += ` AND (name ILIKE $${p.length} OR brand ILIKE $${p.length} OR description ILIKE $${p.length})`;
    }

    q += ' ORDER BY is_featured DESC, created_at DESC';

    p.push(parseInt(limit));
    q += ` LIMIT $${p.length}`;

    p.push(parseInt(offset));
    q += ` OFFSET $${p.length}`;

    const result = await query(q, p);
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// ── Ambil produk by slug ──────────────────────────────────────────────────
exports.getBySlug = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM products WHERE slug = $1 AND is_active = true',
      [req.params.slug]
    );

    if (!result.rows.length) {
      return sendError(res, 'Produk tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── Buat produk baru ──────────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const {
      name,
      category,
      brand,
      description,
      specs       = {},
      images      = [],
      is_featured = false,
    } = req.body;

    if (!name?.trim()) {
      return sendError(res, 'Nama produk wajib diisi.', 422);
    }

    const slug  = `${toSlug(name)}-${Date.now()}`;
    const specsJson = typeof specs === 'string' ? specs : JSON.stringify(specs);

    const result = await query(
      `INSERT INTO products (name, slug, category, brand, description, specs, images, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name.trim(), slug, category, brand, description, specsJson, images, is_featured]
    );

    return sendSuccess(res, result.rows[0], 'Produk berhasil ditambahkan.', 201);
  } catch (err) {
    next(err);
  }
};

// ── Update produk ─────────────────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const {
      name,
      category,
      brand,
      description,
      specs,
      images,
      is_featured,
      is_active,
    } = req.body;

    const specsJson = typeof specs === 'string' ? specs : JSON.stringify(specs || {});

    const result = await query(
      `UPDATE products
       SET name = $1, category = $2, brand = $3, description = $4,
           specs = $5, images = $6, is_featured = $7, is_active = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [name, category, brand, description, specsJson, images || [], is_featured, is_active !== false, req.params.id]
    );

    if (!result.rows.length) {
      return sendError(res, 'Produk tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0], 'Produk berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
};

// ── Hapus produk (soft delete) ────────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    await query('UPDATE products SET is_active = false WHERE id = $1', [req.params.id]);
    return sendSuccess(res, null, 'Produk berhasil dihapus.');
  } catch (err) {
    next(err);
  }
};

// ── Upload gambar produk ──────────────────────────────────────────────────
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'File tidak ditemukan.', 400);
    }

    const imagePath = `products/${req.file.filename}`;
    await query(
      'UPDATE products SET images = array_append(images, $1) WHERE id = $2',
      [imagePath, req.params.id]
    );

    return sendSuccess(res, { path: imagePath }, 'Gambar berhasil diupload.');
  } catch (err) {
    next(err);
  }
};
