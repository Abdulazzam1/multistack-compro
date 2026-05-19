const { query }              = require('../config/db');
const { sendSuccess, sendError } = require('../utils/helpers');
const { sendRFQEmail }       = require('../utils/mailer');

exports.submit = async (req, res, next) => {
  try {
    const {
      company_name,
      contact_name,
      email,
      phone,
      product_interest,
      quantity,
      message,
    } = req.body;

    if (!company_name?.trim() || !email?.trim() || !product_interest?.trim()) {
      return sendError(res, 'Nama perusahaan, email, dan produk wajib diisi.', 422);
    }

    const result = await query(
      `INSERT INTO rfq_submissions
         (company_name, contact_name, email, phone, product_interest, quantity, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [company_name.trim(), contact_name?.trim(), email.trim(), phone, product_interest.trim(), quantity, message]
    );

    // Kirim email notifikasi ke admin (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && process.env.SMTP_USER) {
      sendRFQEmail({ adminEmail, ...req.body }).catch(console.error);
    }

    return sendSuccess(res, result.rows[0], 'RFQ berhasil dikirim.', 201);
  } catch (err) {
    next(err);
  }
};
