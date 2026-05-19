const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/helpers');
const { sendRFQEmail, sendContactEmail } = require('../utils/mailer');

// ════════════════════════════════════════════════════════════
//  CONTACT
// ════════════════════════════════════════════════════════════
const contactCtrl = {
  submit: async (req, res, next) => {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name?.trim() || !email?.trim() || !message?.trim())
        return sendError(res, 'Nama, email, dan pesan wajib diisi.', 422);

      const r = await query(
        'INSERT INTO contact_submissions (name,email,phone,subject,message) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [name.trim(), email.trim(), phone, subject, message.trim()]
      );

      // Kirim email notifikasi (non-blocking)
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail && process.env.SMTP_USER) {
        sendContactEmail({ adminEmail, ...req.body }).catch(console.error);
      }

      sendSuccess(res, r.rows[0], 'Pesan berhasil dikirim.', 201);
    } catch (err) { next(err); }
  },
};

// ════════════════════════════════════════════════════════════
//  RFQ
// ════════════════════════════════════════════════════════════
const rfqCtrl = {
  submit: async (req, res, next) => {
    try {
      const { company_name, contact_name, email, phone, product_interest, quantity, message } = req.body;
      if (!company_name?.trim() || !email?.trim() || !product_interest?.trim())
        return sendError(res, 'Nama perusahaan, email, dan produk wajib diisi.', 422);

      const r = await query(
        `INSERT INTO rfq_submissions (company_name,contact_name,email,phone,product_interest,quantity,message)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [company_name.trim(), contact_name?.trim(), email.trim(), phone, product_interest.trim(), quantity, message]
      );

      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail && process.env.SMTP_USER) {
        sendRFQEmail({ adminEmail, ...req.body }).catch(console.error);
      }

      sendSuccess(res, r.rows[0], 'RFQ berhasil dikirim.', 201);
    } catch (err) { next(err); }
  },
};

// ════════════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════════════
const settingsCtrl = {
  get: async (_req, res, next) => {
    try {
      const r = await query('SELECT * FROM company_settings ORDER BY id LIMIT 1');
      sendSuccess(res, r.rows[0] || {});
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const fields = req.body;
      const existing = await query('SELECT id FROM company_settings LIMIT 1');

      if (existing.rows.length) {
        const keys   = Object.keys(fields);
        const values = Object.values(fields);
        const sets   = keys.map((k, i) => `${k}=$${i + 1}`).join(',');
        values.push(existing.rows[0].id);
        await query(`UPDATE company_settings SET ${sets},updated_at=NOW() WHERE id=$${values.length}`, values);
      } else {
        const keys   = Object.keys(fields);
        const values = Object.values(fields);
        const cols   = keys.join(',');
        const phs    = keys.map((_, i) => `$${i + 1}`).join(',');
        await query(`INSERT INTO company_settings (${cols}) VALUES (${phs})`, values);
      }

      const r = await query('SELECT * FROM company_settings ORDER BY id LIMIT 1');
      sendSuccess(res, r.rows[0], 'Pengaturan berhasil disimpan.');
    } catch (err) { next(err); }
  },
};

module.exports = { contactCtrl, rfqCtrl, settingsCtrl };
