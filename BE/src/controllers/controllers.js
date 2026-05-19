const { query } = require('../config/db');
const { sendSuccess, sendError, toSlug } = require('../utils/helpers');

// ════════════════════════════════════════════════════════════
//  NEWS
// ════════════════════════════════════════════════════════════
const newsCtrl = {
  getAll: async (req, res, next) => {
    try {
      const { category, show_on_home, limit = 20, offset = 0, published = true } = req.query;
      let q = 'SELECT * FROM news WHERE 1=1';
      const p = [];
      if (published !== 'all') { p.push(true); q += ` AND is_published=$${p.length}`; }
      if (category)    { p.push(category);    q += ` AND category=$${p.length}`; }
      if (show_on_home === 'true') { p.push(true); q += ` AND show_on_home=$${p.length}`; }
      q += ' ORDER BY created_at DESC';
      if (limit !== 'all') { p.push(parseInt(limit)); q += ` LIMIT $${p.length}`; }
      p.push(parseInt(offset)); q += ` OFFSET $${p.length}`;
      const result = await query(q, p);
      sendSuccess(res, result.rows);
    } catch (err) { next(err); }
  },

  getBySlug: async (req, res, next) => {
    try {
      const r = await query('SELECT * FROM news WHERE slug=$1 AND is_published=true', [req.params.slug]);
      if (!r.rows.length) return sendError(res, 'Berita tidak ditemukan.', 404);
      sendSuccess(res, r.rows[0]);
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const { title, category = 'berita', excerpt, content, cover_image, author = 'Admin Multistack', is_published = false, show_on_home = false } = req.body;
      if (!title?.trim()) return sendError(res, 'Judul berita wajib diisi.', 422);
      const slug = toSlug(title) + '-' + Date.now();
      const r = await query(
        `INSERT INTO news (title,slug,category,excerpt,content,cover_image,author,is_published,show_on_home)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [title.trim(), slug, category, excerpt, content, cover_image, author, is_published, show_on_home]
      );
      sendSuccess(res, r.rows[0], 'Berita berhasil ditambahkan.', 201);
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const { title, category, excerpt, content, cover_image, author, is_published, show_on_home } = req.body;
      const r = await query(
        `UPDATE news SET title=$1,category=$2,excerpt=$3,content=$4,cover_image=$5,
         author=$6,is_published=$7,show_on_home=$8,updated_at=NOW() WHERE id=$9 RETURNING *`,
        [title, category, excerpt, content, cover_image, author, is_published, show_on_home, req.params.id]
      );
      if (!r.rows.length) return sendError(res, 'Berita tidak ditemukan.', 404);
      sendSuccess(res, r.rows[0], 'Berita berhasil diperbarui.');
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try {
      await query('DELETE FROM news WHERE id=$1', [req.params.id]);
      sendSuccess(res, null, 'Berita berhasil dihapus.');
    } catch (err) { next(err); }
  },
};

// ════════════════════════════════════════════════════════════
//  PORTFOLIO
// ════════════════════════════════════════════════════════════
const portfolioCtrl = {
  getAll: async (req, res, next) => {
    try {
      const { category, show_on_home, featured } = req.query;
      let q = 'SELECT * FROM portfolio WHERE is_active=true';
      const p = [];
      if (category)    { p.push(category); q += ` AND category=$${p.length}`; }
      if (show_on_home === 'true') { p.push(true); q += ` AND show_on_home=$${p.length}`; }
      if (featured     === 'true') { p.push(true); q += ` AND is_featured=$${p.length}`; }
      q += ' ORDER BY year DESC, created_at DESC';
      const r = await query(q, p);
      sendSuccess(res, r.rows);
    } catch (err) { next(err); }
  },

  getBySlug: async (req, res, next) => {
    try {
      const r = await query('SELECT * FROM portfolio WHERE slug=$1 AND is_active=true', [req.params.slug]);
      if (!r.rows.length) return sendError(res, 'Portfolio tidak ditemukan.', 404);
      sendSuccess(res, r.rows[0]);
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const { title, client, location, category, description, scope, images = [], year, is_featured = false, show_on_home = false } = req.body;
      if (!title?.trim()) return sendError(res, 'Judul portfolio wajib diisi.', 422);
      const slug = toSlug(title) + '-' + Date.now();
      const r = await query(
        `INSERT INTO portfolio (title,slug,client,location,category,description,scope,images,year,is_featured,show_on_home)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [title.trim(), slug, client, location, category, description, scope, images, year, is_featured, show_on_home]
      );
      sendSuccess(res, r.rows[0], 'Portfolio berhasil ditambahkan.', 201);
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const { title, client, location, category, description, scope, images, year, is_featured, is_active, show_on_home } = req.body;
      const r = await query(
        `UPDATE portfolio SET title=$1,client=$2,location=$3,category=$4,description=$5,
         scope=$6,images=$7,year=$8,is_featured=$9,is_active=$10,show_on_home=$11 WHERE id=$12 RETURNING *`,
        [title, client, location, category, description, scope, images, year, is_featured, is_active !== false, show_on_home, req.params.id]
      );
      if (!r.rows.length) return sendError(res, 'Portfolio tidak ditemukan.', 404);
      sendSuccess(res, r.rows[0], 'Portfolio berhasil diperbarui.');
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try {
      await query('UPDATE portfolio SET is_active=false WHERE id=$1', [req.params.id]);
      sendSuccess(res, null, 'Portfolio berhasil dihapus.');
    } catch (err) { next(err); }
  },
};

// ════════════════════════════════════════════════════════════
//  TESTIMONIALS
// ════════════════════════════════════════════════════════════
const testimonialCtrl = {
  getAll: async (_req, res, next) => {
    try {
      const r = await query('SELECT * FROM testimonials WHERE is_active=true ORDER BY created_at DESC');
      sendSuccess(res, r.rows);
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const { client_name, client_title, client_company, content, rating = 5, avatar } = req.body;
      if (!client_name?.trim() || !content?.trim()) return sendError(res, 'Nama klien dan isi testimoni wajib diisi.', 422);
      const r = await query(
        `INSERT INTO testimonials (client_name,client_title,client_company,content,rating,avatar)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [client_name.trim(), client_title, client_company, content.trim(), rating, avatar]
      );
      sendSuccess(res, r.rows[0], 'Testimoni berhasil ditambahkan.', 201);
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const { client_name, client_title, client_company, content, rating, avatar, is_active } = req.body;
      const r = await query(
        `UPDATE testimonials SET client_name=$1,client_title=$2,client_company=$3,
         content=$4,rating=$5,avatar=$6,is_active=$7 WHERE id=$8 RETURNING *`,
        [client_name, client_title, client_company, content, rating, avatar, is_active !== false, req.params.id]
      );
      if (!r.rows.length) return sendError(res, 'Testimoni tidak ditemukan.', 404);
      sendSuccess(res, r.rows[0], 'Testimoni berhasil diperbarui.');
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try {
      await query('UPDATE testimonials SET is_active=false WHERE id=$1', [req.params.id]);
      sendSuccess(res, null, 'Testimoni berhasil dihapus.');
    } catch (err) { next(err); }
  },
};

module.exports = { newsCtrl, portfolioCtrl, testimonialCtrl };
