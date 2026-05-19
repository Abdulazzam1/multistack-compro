const express            = require('express');
const router             = express.Router();
const auth               = require('../../middleware/auth');
const upload             = require('../../middleware/upload');
const { query }          = require('../../config/db');
const { sendSuccess }    = require('../../utils/helpers');

// ── Dashboard Metrics ────────────────────────────────────────────────────────
router.get('/dashboard/metrics', auth, async (_req, res, next) => {
  try {
    const [
      rfqUnread, contactUnread,
      products,  news,   services,
      portfolio, testimonials,
      rfqTotal,  contactTotal,
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM rfq_submissions WHERE is_read = false'),
      query('SELECT COUNT(*) FROM contact_submissions WHERE is_read = false'),
      query('SELECT COUNT(*) FROM products WHERE is_active = true'),
      query('SELECT COUNT(*) FROM news WHERE is_published = true'),
      query('SELECT COUNT(*) FROM services WHERE is_active = true'),
      query('SELECT COUNT(*) FROM portfolio WHERE is_active = true'),
      query('SELECT COUNT(*) FROM testimonials WHERE is_active = true'),
      query('SELECT COUNT(*) FROM rfq_submissions'),
      query('SELECT COUNT(*) FROM contact_submissions'),
    ]);

    return sendSuccess(res, {
      rfq_unread:         parseInt(rfqUnread.rows[0].count),
      contact_unread:     parseInt(contactUnread.rows[0].count),
      products_active:    parseInt(products.rows[0].count),
      news_published:     parseInt(news.rows[0].count),
      services_total:     parseInt(services.rows[0].count),
      portfolio_total:    parseInt(portfolio.rows[0].count),
      testimonials_total: parseInt(testimonials.rows[0].count),
      rfq_total:          parseInt(rfqTotal.rows[0].count),
      contact_total:      parseInt(contactTotal.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
});

// ── Upload File ──────────────────────────────────────────────────────────────
router.post('/upload', auth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan.' });
    }

    const folder = req._uploadFolder || 'general';
    return sendSuccess(res, { path: `${folder}/${req.file.filename}` }, 'File berhasil diupload.');
  } catch (err) {
    next(err);
  }
});

// ── Daftar Pesan Kontak ──────────────────────────────────────────────────────
router.get('/contact', auth, async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const [data, count] = await Promise.all([
      query(
        'SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      query('SELECT COUNT(*) FROM contact_submissions'),
    ]);

    return sendSuccess(res, {
      items: data.rows,
      total: parseInt(count.rows[0].count),
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/contact/:id/read — tandai pesan sudah dibaca
router.patch('/contact/:id/read', auth, async (req, res, next) => {
  try {
    await query(
      'UPDATE contact_submissions SET is_read = true WHERE id = $1',
      [req.params.id]
    );
    return sendSuccess(res, null, 'Pesan ditandai sudah dibaca.');
  } catch (err) {
    next(err);
  }
});

// ── Daftar RFQ ───────────────────────────────────────────────────────────────
router.get('/rfq', auth, async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const [data, count] = await Promise.all([
      query(
        'SELECT * FROM rfq_submissions ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      query('SELECT COUNT(*) FROM rfq_submissions'),
    ]);

    return sendSuccess(res, {
      items: data.rows,
      total: parseInt(count.rows[0].count),
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/rfq/:id/read — tandai RFQ sudah dibaca + update status
router.patch('/rfq/:id/read', auth, async (req, res, next) => {
  try {
    const status = req.body.status || 'dibaca';
    await query(
      'UPDATE rfq_submissions SET is_read = true, status = $2 WHERE id = $1',
      [req.params.id, status]
    );
    return sendSuccess(res, null, 'RFQ berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
