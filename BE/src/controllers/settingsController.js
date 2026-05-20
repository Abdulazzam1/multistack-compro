const { query }       = require('../config/db');
const { sendSuccess } = require('../utils/helpers');

// Kolom-kolom bertipe JSONB di tabel company_settings
// Nilai array/object harus di-stringify sebelum dikirim ke PostgreSQL
const JSONB_FIELDS = ['contact_persons', 'footer_contacts', 'company_values'];

exports.get = async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM company_settings ORDER BY id LIMIT 1'
    );
    return sendSuccess(res, result.rows[0] || {});
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    // Pisahkan field metadata agar tidak masuk ke query SET
    const { id, created_at, updated_at, ...fields } = req.body;

    // Tidak ada field untuk diupdate
    if (Object.keys(fields).length === 0) {
      const result = await query('SELECT * FROM company_settings ORDER BY id LIMIT 1');
      return sendSuccess(res, result.rows[0], 'Tidak ada perubahan.');
    }

    // Stringify kolom JSONB jika nilainya array atau object
    const keys   = Object.keys(fields);
    const values = keys.map(key => {
      const val = fields[key];
      if (JSONB_FIELDS.includes(key) && (Array.isArray(val) || (val && typeof val === 'object'))) {
        return JSON.stringify(val);
      }
      return val;
    });

    const existing = await query('SELECT id FROM company_settings LIMIT 1');

    if (existing.rows.length) {
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      values.push(existing.rows[0].id);
      await query(
        `UPDATE company_settings SET ${sets}, updated_at = NOW() WHERE id = $${values.length}`,
        values
      );
    } else {
      const cols = keys.join(', ');
      const phs  = keys.map((_, i) => `$${i + 1}`).join(', ');
      await query(
        `INSERT INTO company_settings (${cols}) VALUES (${phs})`,
        values
      );
    }

    const result = await query('SELECT * FROM company_settings ORDER BY id LIMIT 1');
    return sendSuccess(res, result.rows[0], 'Pengaturan berhasil disimpan.');
  } catch (err) {
    next(err);
  }
};