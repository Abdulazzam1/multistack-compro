const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { query }              = require('../config/db');
const { sendSuccess, sendError } = require('../utils/helpers');

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email dan password wajib diisi.', 422);
    }

    const result = await query(
      'SELECT * FROM admin_users WHERE email = $1 AND is_active = true',
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];

    if (!user) {
      return sendError(res, 'Email atau password salah.', 401);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return sendError(res, 'Email atau password salah.', 401);
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return sendSuccess(res, {
      token,
      admin: { id: user.id, name: user.name, email: user.email },
    }, 'Login berhasil.');
  } catch (err) {
    next(err);
  }
};

// ── Me ────────────────────────────────────────────────────────────────────────
exports.me = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, created_at FROM admin_users WHERE id = $1',
      [req.admin.id]
    );

    if (!result.rows.length) {
      return sendError(res, 'Admin tidak ditemukan.', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── Ganti Password ────────────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return sendError(res, 'Password lama dan baru wajib diisi.', 422);
    }
    if (new_password.length < 8) {
      return sendError(res, 'Password baru minimal 8 karakter.', 422);
    }

    const result = await query(
      'SELECT password_hash FROM admin_users WHERE id = $1',
      [req.admin.id]
    );
    const user = result.rows[0];

    if (!user) {
      return sendError(res, 'Admin tidak ditemukan.', 404);
    }

    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      return sendError(res, 'Password lama tidak sesuai.', 401);
    }

    const hash = await bcrypt.hash(new_password, 12);
    await query('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [hash, req.admin.id]);

    return sendSuccess(res, null, 'Password berhasil diubah.');
  } catch (err) {
    next(err);
  }
};
