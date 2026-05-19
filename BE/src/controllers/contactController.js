const { query }              = require('../config/db');
const { sendSuccess, sendError } = require('../utils/helpers');
const { sendContactEmail }   = require('../utils/mailer');

exports.submit = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return sendError(res, 'Nama, email, dan pesan wajib diisi.', 422);
    }

    const result = await query(
      `INSERT INTO contact_submissions (name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), email.trim(), phone, subject, message.trim()]
    );

    // Kirim email notifikasi ke admin (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && process.env.SMTP_USER) {
      sendContactEmail({ adminEmail, ...req.body }).catch(console.error);
    }

    return sendSuccess(res, result.rows[0], 'Pesan berhasil dikirim.', 201);
  } catch (err) {
    next(err);
  }
};
